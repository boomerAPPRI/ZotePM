const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const migrate = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    }
};

migrate();
