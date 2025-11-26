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
        await db.query('CREATE INDEX IF NOT EXISTS idx_comments_market_id ON comments(market_id);');
        console.log('Migration check: comments table exists or was created.');
    } catch (err) {
        console.error('Migration failed:', err);
        // We don't exit here, to allow the app to try starting anyway, 
        // but logging the error is crucial.
    }
};

module.exports = runMigrations;
