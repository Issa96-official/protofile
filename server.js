const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Ladda environment variables för development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { pool, initializeDatabase, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialisera databas endast om DATABASE_URL finns
const initDB = async () => {
    if (process.env.DATABASE_URL) {
        try {
            await initializeDatabase();
            console.log('✅ Databas initialiserad');
        } catch (error) {
            console.error('❌ Databas initialiseringsfel:', error);
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
        }
    } else {
        console.log('⚠️  Ingen DATABASE_URL - hoppar över databas initialisering');
    }
};

initDB().catch(console.error);

// Multer konfiguration för filuppladdning
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Endast bilder tillåtna (jpeg, jpg, png, gif)'));
        }
    }
});

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session konfiguration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Temporary fix for Render - change to true when HTTPS is properly configured
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 timmar
    }
}));

// Middleware för att kontrollera admin-autentisering
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Autentisering krävs' });
    }
};

// Routes

// Huvudsida - visa profil och sociala medielänkar
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin-inloggningssida
app.get('/admin', (req, res) => {
    console.log('Admin route accessed, session user:', req.session.user); // Debug
    console.log('Session ID:', req.sessionID); // Debug
    
    if (req.session.user) {
        console.log('User authenticated, serving admin.html'); // Debug
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        console.log('User not authenticated, serving login.html'); // Debug
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// API för att hämta profildata
app.get('/api/profile', async (req, res) => {
    try {
        const userResult = await pool.query("SELECT name, profile_image FROM users WHERE id = 1");
        const user = userResult.rows[0];
        
        const linksResult = await pool.query("SELECT * FROM social_links WHERE is_active = true ORDER BY display_order");
        const links = linksResult.rows;
        
        res.json({
            profile: user || { name: 'Ägare', profile_image: null },
            social_links: links
        });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// Login API
app.post('/api/login', [
    body('username').notEmpty().withMessage('Användarnamn krävs'),
    body('password').notEmpty().withMessage('Lösenord krävs')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            console.log('Password match, creating session for user:', user.username); // Debug
            req.session.user = { id: user.id, username: user.username };
            console.log('Session created, session ID:', req.sessionID); // Debug
            console.log('Session user after creation:', req.session.user); // Debug
            
            // Force session save
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({ error: 'Session kunde inte sparas' });
                }
                console.log('Session saved successfully'); // Debug
                res.json({ success: true, message: 'Inloggning lyckades' });
            });
        } else {
            res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
        }
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// Session status API
app.get('/api/session-status', (req, res) => {
    console.log('Session status check, user:', req.session.user);
    res.json({ 
        authenticated: !!req.session.user,
        user: req.session.user || null,
        sessionID: req.sessionID
    });
});

// Logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Fel vid utloggning' });
        }
        res.json({ success: true, message: 'Utloggning lyckades' });
    });
});

// API för att hämta admin-data
app.get('/api/admin/profile', requireAuth, async (req, res) => {
    try {
        const result = await pool.query("SELECT name, profile_image FROM users WHERE id = $1", [req.session.user.id]);
        const user = result.rows[0];
        res.json(user);
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att uppdatera profil
app.post('/api/admin/profile', requireAuth, upload.single('profile_image'), [
    body('name').notEmpty().withMessage('Namn krävs').isLength({ max: 100 }).withMessage('Namn får vara max 100 tecken')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    let profileImage = null;

    if (req.file) {
        profileImage = '/uploads/' + req.file.filename;
    }

    try {
        let query, params;
        if (profileImage) {
            query = "UPDATE users SET name = $1, profile_image = $2 WHERE id = $3";
            params = [name, profileImage, req.session.user.id];
        } else {
            query = "UPDATE users SET name = $1 WHERE id = $2";
            params = [name, req.session.user.id];
        }

        await pool.query(query, params);
        res.json({ success: true, message: 'Profil uppdaterad' });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att hämta sociala medielänkar för admin
app.get('/api/admin/social-links', requireAuth, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM social_links ORDER BY display_order");
        res.json(result.rows);
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att lägga till social medielänk
app.post('/api/admin/social-links', requireAuth, [
    body('platform').notEmpty().withMessage('Plattform krävs').isLength({ max: 50 }).withMessage('Plattform får vara max 50 tecken'),
    body('url').isURL().withMessage('Giltig URL krävs'),
    body('icon_class').optional().isLength({ max: 50 }).withMessage('Ikon-klass får vara max 50 tecken')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { platform, url, icon_class, display_order = 0 } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO social_links (platform, url, icon_class, display_order) VALUES ($1, $2, $3, $4) RETURNING id",
            [platform, url, icon_class, display_order]
        );
        res.json({ success: true, id: result.rows[0].id, message: 'Social medielänk tillagd' });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att uppdatera social medielänk
app.put('/api/admin/social-links/:id', requireAuth, [
    body('platform').notEmpty().withMessage('Plattform krävs').isLength({ max: 50 }).withMessage('Plattform får vara max 50 tecken'),
    body('url').isURL().withMessage('Giltig URL krävs'),
    body('icon_class').optional().isLength({ max: 50 }).withMessage('Ikon-klass får vara max 50 tecken')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { platform, url, icon_class, display_order, is_active } = req.body;

    try {
        await pool.query(
            "UPDATE social_links SET platform = $1, url = $2, icon_class = $3, display_order = $4, is_active = $5 WHERE id = $6",
            [platform, url, icon_class, display_order, is_active, id]
        );
        res.json({ success: true, message: 'Social medielänk uppdaterad' });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att ta bort social medielänk
app.delete('/api/admin/social-links/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM social_links WHERE id = $1", [id]);
        res.json({ success: true, message: 'Social medielänk borttagen' });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// API för att ändra lösenord
app.post('/api/admin/change-password', requireAuth, [
    body('currentPassword').notEmpty().withMessage('Nuvarande lösenord krävs'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nytt lösenord måste vara minst 6 tecken')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const result = await pool.query("SELECT password FROM users WHERE id = $1", [req.session.user.id]);
        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Nuvarande lösenord är felaktigt' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, req.session.user.id]);
        
        res.json({ success: true, message: 'Lösenord ändrat' });
    } catch (error) {
        console.error('Databasfel:', error);
        res.status(500).json({ error: 'Databasfel' });
    }
});

// Starta servern
const startServer = async () => {
    try {
        // För Render - endast testa anslutning om DATABASE_URL finns
        if (process.env.DATABASE_URL) {
            console.log('DATABASE_URL hittad, testar PostgreSQL-anslutning...');
            const connected = await testConnection();
            if (!connected) {
                console.error('⚠️  Varning: Kunde inte ansluta till PostgreSQL. Kontrollera DATABASE_URL.');
                console.log('💡 Skapa en PostgreSQL-databas i Render Dashboard först!');
                
                // I produktion, avsluta om ingen databas
                if (process.env.NODE_ENV === 'production') {
                    console.error('🚫 Servern kan inte starta utan databas i produktion.');
                    process.exit(1);
                }
            } else {
                console.log('✅ PostgreSQL anslutning lyckades');
            }
        } else {
            console.log('⚠️  Ingen DATABASE_URL hittad. Kör utan databas för tillfället.');
            console.log('💡 Lägg till DATABASE_URL i environment variables för att aktivera databas.');
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server körs på port ${PORT}`);
            console.log(`🌍 Miljö: ${process.env.NODE_ENV || 'development'}`);
            
            if (process.env.DATABASE_URL) {
                console.log('🗄️  PostgreSQL databas ansluten');
            } else {
                console.log('⚠️  Kör utan databas - lägg till DATABASE_URL');
            }
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`🏠 Huvudsida: http://localhost:${PORT}`);
                console.log(`🔐 Admin-panel: http://localhost:${PORT}/admin`);
            }
        });
    } catch (error) {
        console.error('❌ Fel vid serverstart:', error);
        
        // I development, försök starta ändå
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Försöker starta servern utan databas (development mode)...');
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`⚠️  Server körs på port ${PORT} UTAN DATABAS`);
                console.log('💡 Konfigurera DATABASE_URL för full funktionalitet');
            });
        } else {
            process.exit(1);
        }
    }
};

startServer();
