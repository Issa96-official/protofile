const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Databaskonfiguration
const db = new sqlite3.Database('./database.db');

// Skapa tabeller om de inte finns
db.serialize(() => {
    // Användartabell för admin
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabell för sociala medielänkar
    db.run(`CREATE TABLE IF NOT EXISTS social_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_class TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Skapa standardanvändare om ingen finns
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
            console.error('Databasfel:', err);
            return;
        }
        if (row.count === 0) {
            const defaultPassword = 'admin123';
            bcrypt.hash(defaultPassword, 10, (err, hash) => {
                if (err) {
                    console.error('Fel vid hashning av lösenord:', err);
                    return;
                }
                db.run("INSERT INTO users (username, password, name) VALUES (?, ?, ?)", 
                    ['admin', hash, 'Ägare'], (err) => {
                    if (err) {
                        console.error('Fel vid skapande av standardanvändare:', err);
                    } else {
                        console.log('Standardanvändare skapad: admin / admin123');
                    }
                });
            });
        }
    });
});

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
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // sätt till true för HTTPS
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
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// API för att hämta profildata
app.get('/api/profile', (req, res) => {
    db.get("SELECT name, profile_image FROM users WHERE id = 1", (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        
        db.all("SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order", (err, links) => {
            if (err) {
                return res.status(500).json({ error: 'Databasfel' });
            }
            
            res.json({
                profile: user || { name: 'Ägare', profile_image: null },
                social_links: links
            });
        });
    });
});

// Login API
app.post('/api/login', [
    body('username').notEmpty().withMessage('Användarnamn krävs'),
    body('password').notEmpty().withMessage('Lösenord krävs')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Serverfel' });
            }

            if (result) {
                req.session.user = { id: user.id, username: user.username };
                res.json({ success: true, message: 'Inloggning lyckades' });
            } else {
                res.status(401).json({ error: 'Ogiltigt användarnamn eller lösenord' });
            }
        });
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
app.get('/api/admin/profile', requireAuth, (req, res) => {
    db.get("SELECT name, profile_image FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json(user);
    });
});

// API för att uppdatera profil
app.post('/api/admin/profile', requireAuth, upload.single('profile_image'), [
    body('name').notEmpty().withMessage('Namn krävs').isLength({ max: 100 }).withMessage('Namn får vara max 100 tecken')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    let profileImage = null;

    if (req.file) {
        profileImage = '/uploads/' + req.file.filename;
    }

    let query, params;
    if (profileImage) {
        query = "UPDATE users SET name = ?, profile_image = ? WHERE id = ?";
        params = [name, profileImage, req.session.user.id];
    } else {
        query = "UPDATE users SET name = ? WHERE id = ?";
        params = [name, req.session.user.id];
    }

    db.run(query, params, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json({ success: true, message: 'Profil uppdaterad' });
    });
});

// API för att hämta sociala medielänkar för admin
app.get('/api/admin/social-links', requireAuth, (req, res) => {
    db.all("SELECT * FROM social_links ORDER BY display_order", (err, links) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json(links);
    });
});

// API för att lägga till social medielänk
app.post('/api/admin/social-links', requireAuth, [
    body('platform').notEmpty().withMessage('Plattform krävs').isLength({ max: 50 }).withMessage('Plattform får vara max 50 tecken'),
    body('url').isURL().withMessage('Giltig URL krävs'),
    body('icon_class').optional().isLength({ max: 50 }).withMessage('Ikon-klass får vara max 50 tecken')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { platform, url, icon_class, display_order = 0 } = req.body;

    db.run("INSERT INTO social_links (platform, url, icon_class, display_order) VALUES (?, ?, ?, ?)",
        [platform, url, icon_class, display_order], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json({ success: true, id: this.lastID, message: 'Social medielänk tillagd' });
    });
});

// API för att uppdatera social medielänk
app.put('/api/admin/social-links/:id', requireAuth, [
    body('platform').notEmpty().withMessage('Plattform krävs').isLength({ max: 50 }).withMessage('Plattform får vara max 50 tecken'),
    body('url').isURL().withMessage('Giltig URL krävs'),
    body('icon_class').optional().isLength({ max: 50 }).withMessage('Ikon-klass får vara max 50 tecken')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { platform, url, icon_class, display_order, is_active } = req.body;

    db.run("UPDATE social_links SET platform = ?, url = ?, icon_class = ?, display_order = ?, is_active = ? WHERE id = ?",
        [platform, url, icon_class, display_order, is_active ? 1 : 0, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json({ success: true, message: 'Social medielänk uppdaterad' });
    });
});

// API för att ta bort social medielänk
app.delete('/api/admin/social-links/:id', requireAuth, (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM social_links WHERE id = ?", [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }
        res.json({ success: true, message: 'Social medielänk borttagen' });
    });
});

// API för att ändra lösenord
app.post('/api/admin/change-password', requireAuth, [
    body('currentPassword').notEmpty().withMessage('Nuvarande lösenord krävs'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nytt lösenord måste vara minst 6 tecken')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    db.get("SELECT password FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Databasfel' });
        }

        bcrypt.compare(currentPassword, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Serverfel' });
            }

            if (!result) {
                return res.status(401).json({ error: 'Nuvarande lösenord är felaktigt' });
            }

            bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: 'Serverfel' });
                }

                db.run("UPDATE users SET password = ? WHERE id = ?", [hash, req.session.user.id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Databasfel' });
                    }
                    res.json({ success: true, message: 'Lösenord ändrat' });
                });
            });
        });
    });
});

// Starta servern
app.listen(PORT, () => {
    console.log(`Server körs på port ${PORT}`);
    console.log(`Huvudsida: http://localhost:${PORT}`);
    console.log(`Admin-panel: http://localhost:${PORT}/admin`);
});
