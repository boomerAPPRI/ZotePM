const db = require('./db');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });
// Fallback if .env is in parent
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const migrateDescription = async () => {
    // Only use the pool from db module if it's exported correctly, 
    // otherwise create new pool for migration script to be standalone.
    // However, db.js exports query and pool.

    // Let's create a direct connection to be safe like previous migrations
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('Running migration: Add description to transactions table...');

    try {
        await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT');
        console.log('Migration success: description column added.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
};

migrateDescription();
