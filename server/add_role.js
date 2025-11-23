const { pool } = require('./db');

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
        `);
        console.log('Added role column to users table');

        // Set the first user as admin for testing
        await pool.query(`
            UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1);
        `);
        console.log('Set first user as admin');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    }
};

migrate();
