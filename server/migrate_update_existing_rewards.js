const db = require('./db');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const updateRewards = async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('Running migration: Update existing reward transactions...');

    try {
        const res = await pool.query(`
            UPDATE transactions 
            SET type = 'profile_challenge_reward', 
                description = 'User Profile Update Challenge Reward' 
            WHERE type = 'reward' AND amount = 500
        `);
        console.log(`Migration success: Updated ${res.rowCount} transaction records.`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
};

updateRewards();
