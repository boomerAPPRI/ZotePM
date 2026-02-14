const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
    const client = await pool.connect();
    try {
        // Check if any active challenge exists
        const res = await client.query("SELECT * FROM challenges WHERE is_active = true");
        if (res.rows.length > 0) {
            console.log('Active challenge already exists, skipping seed.');
            return;
        }

        // Create a Weekly Challenge starting this Monday
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        const nextSunday = new Date(monday);
        nextSunday.setDate(monday.getDate() + 6);
        nextSunday.setHours(23, 59, 59, 999);

        await client.query(`
      INSERT INTO challenges (title, description, start_date, end_date, market_ids, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
            'Weekly Trading Championship',
            'Compete for the highest net profit this week! All markets are eligible. Top 3 winners get a badge.',
            monday.toISOString(),
            nextSunday.toISOString(),
            null, // All markets
            true
        ]);

        console.log('Seeded "Weekly Trading Championship"');
    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
