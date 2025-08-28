// Test script för att kontrollera PostgreSQL anslutning
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testDatabase() {
    try {
        console.log('🔍 Testar PostgreSQL anslutning...');
        console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Är satt' : 'SAKNAS!');
        
        const client = await pool.connect();
        console.log('✅ Anslutning lyckades!');
        
        // Test en enkel query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('🕐 Databasserver tid:', result.rows[0].current_time);
        
        client.release();
        console.log('🎉 Databasen fungerar perfekt!');
        
    } catch (error) {
        console.error('❌ Databasfel:', error.message);
        console.log('\n💡 Möjliga lösningar:');
        console.log('1. Kontrollera att DATABASE_URL är korrekt i .env');
        console.log('2. Skapa gratis PostgreSQL databas på ElephantSQL');
        console.log('3. Läs DATABAS_SETUP_GUIDE.md för instruktioner');
    } finally {
        await pool.end();
    }
}

testDatabase();
