const pool = require('./db');
require('dotenv').config();

const migrateTerms = async () => {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP');
        console.log('Migration successful: Added terms_accepted_at to users table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        // Close the pool only if this script is run directly
        if (require.main === module) {
            pool.end();
        }
    }
};

if (require.main === module) {
    migrateTerms();
}

module.exports = migrateTerms;
