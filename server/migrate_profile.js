const db = require('./db');

const runMigration = async () => {
    try {
        console.log('Adding profile columns to users table...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS country VARCHAR(255),
            ADD COLUMN IF NOT EXISTS city VARCHAR(255),
            ADD COLUMN IF NOT EXISTS age_range VARCHAR(50),
            ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
        `);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
