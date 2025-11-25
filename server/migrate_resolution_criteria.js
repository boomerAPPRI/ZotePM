const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Add resolution_criteria to markets table...');

        // Check if column exists
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='markets' AND column_name='resolution_criteria';
        `);

        if (res.rows.length === 0) {
            await client.query(`
                ALTER TABLE markets 
                ADD COLUMN resolution_criteria TEXT;
            `);
            console.log('Successfully added resolution_criteria column.');
        } else {
            console.log('Column resolution_criteria already exists.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
