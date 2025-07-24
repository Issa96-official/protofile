const { Pool } = require('pg');

// Databas konfiguration
const getDatabaseConfig = () => {
    // För Render, använd DATABASE_URL om det finns
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
    }
    
    // Fallback för lokal utveckling
    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'social_media_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: false
    };
};

const pool = new Pool(getDatabaseConfig());

// Skapa tabeller om de inte finns
const initializeDatabase = async () => {
    try {
        console.log('Initialiserar PostgreSQL databas...');
        
        // Skapa användartabell
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                profile_image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Skapa tabell för sociala medielänkar
        await pool.query(`
            CREATE TABLE IF NOT EXISTS social_links (
                id SERIAL PRIMARY KEY,
                platform VARCHAR(100) NOT NULL,
                url TEXT NOT NULL,
                icon_class VARCHAR(100),
                display_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Databastabeller skapade/kontrollerade');
        
        // Kontrollera om standardanvändare finns
        const userCheck = await pool.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(userCheck.rows[0].count) === 0) {
            console.log('Skapar standardanvändare...');
            
            const bcrypt = require('bcryptjs');
            const defaultPassword = 'admin123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            
            await pool.query(
                'INSERT INTO users (username, password, name) VALUES ($1, $2, $3)',
                ['admin', hashedPassword, 'Ägare']
            );
            
            console.log('Standardanvändare skapad: admin / admin123');
        } else {
            console.log('Standardanvändare finns redan');
        }
        
        console.log('Databasinitialiseringen klar!');
        
    } catch (error) {
        console.error('Fel vid databasinitialiseringen:', error);
        throw error;
    }
};

// Test databasanslutning
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL anslutning lyckades');
        client.release();
        return true;
    } catch (error) {
        console.error('PostgreSQL anslutningsfel:', error);
        return false;
    }
};

module.exports = {
    pool,
    initializeDatabase,
    testConnection
};
