const { Pool } = require('pg');
const dotenv = require('dotenv');
const mockDb = require('./utils/mockDb');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const useMock = process.env.USE_MOCK_DB === 'true';

module.exports = {
    query: (text, params) => useMock ? mockDb.query(text, params) : pool.query(text, params),
    pool,
};
