const db = require('./db');

const runMigrations = async () => {
    console.log('Running migrations...');
    try {
        // Add winner_outcome_id to markets table
        await db.query('ALTER TABLE markets ADD COLUMN IF NOT EXISTS winner_outcome_id INTEGER');
        console.log('Migration check: winner_outcome_id column exists or was added.');
    } catch (err) {
        console.error('Migration failed:', err);
        // We don't exit here, to allow the app to try starting anyway, 
        // but logging the error is crucial.
    }
};

module.exports = runMigrations;
