const db = require('./db');

const migrate = async () => {
    try {
        await db.query('ALTER TABLE markets ADD COLUMN IF NOT EXISTS winner_outcome_id INTEGER');
        console.log('Migration successful: Added winner_outcome_id to markets table');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
