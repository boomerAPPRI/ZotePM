const db = require('./db');

const runMigrations = async () => {
    console.log('Running migrations...');
    try {
        // Add winner_outcome_id to markets table
        await db.query('ALTER TABLE markets ADD COLUMN IF NOT EXISTS winner_outcome_id INTEGER');
        console.log('Migration check: winner_outcome_id column exists or was added.');

        // Create comments table
        await db.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                market_id INTEGER REFERENCES markets(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Create challenges table
        await db.query(`
            CREATE TABLE IF NOT EXISTS challenges (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                market_ids JSONB, 
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migration check: challenges table exists or was created.');

        // Add profile_completed to users
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
        `);
        console.log('Migration check: profile_completed column exists or was added.');

        await db.query('CREATE INDEX IF NOT EXISTS idx_comments_market_id ON comments(market_id);');
        console.log('Migration check: comments table exists or was created.');

        // Add terms_accepted_at to users
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;
        `);
        console.log('Migration check: terms_accepted_at column exists or was added.');

        // Add description to transactions
        await db.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT');
        console.log('Migration check: description column exists or was added to transactions.');

        // Seed initial challenge if none exists
        const challengeCheck = await db.query("SELECT * FROM challenges WHERE is_active = true");
        if (challengeCheck.rows.length === 0) {
            console.log('No active challenges found. Seeding initial challenge...');

            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(today.setDate(diff));
            monday.setHours(0, 0, 0, 0);

            const nextSunday = new Date(monday);
            nextSunday.setDate(monday.getDate() + 6);
            nextSunday.setHours(23, 59, 59, 999);

            await db.query(`
                INSERT INTO challenges (title, description, start_date, end_date, market_ids, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                'Weekly Trading Championship',
                'Compete for the highest net profit this week! All markets are eligible. Top 3 winners get a badge.',
                monday.toISOString(),
                nextSunday.toISOString(),
                null,
                true
            ]);
            console.log('Seeded "Weekly Trading Championship"');
        } else {
            console.log('Active challenges exist. Skipping seed.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
        // We don't exit here, to allow the app to try starting anyway, 
        // but logging the error is crucial.
    }
};

module.exports = runMigrations;
