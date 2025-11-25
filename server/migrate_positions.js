const db = require('./db');

const migratePositions = async () => {
    try {
        console.log('Starting positions table migration...');

        // 1. Create positions table
        await db.query(`
            CREATE TABLE IF NOT EXISTS positions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                market_id INTEGER REFERENCES markets(id),
                outcome_id INTEGER NOT NULL,
                shares DECIMAL(10, 2) DEFAULT 0.00,
                invested DECIMAL(10, 2) DEFAULT 0.00,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, market_id, outcome_id)
            );
        `);
        console.log('Positions table created.');

        // 2. Populate from orders
        // We need to sum up all orders for each user/market/outcome
        const ordersResult = await db.query(`
            SELECT 
                user_id, 
                market_id, 
                outcome_id, 
                SUM(amount) as total_shares, 
                SUM(price) as total_invested 
            FROM orders 
            GROUP BY user_id, market_id, outcome_id
        `);

        console.log(`Found ${ordersResult.rows.length} aggregated positions to insert.`);

        for (const row of ordersResult.rows) {
            await db.query(`
                INSERT INTO positions (user_id, market_id, outcome_id, shares, invested)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, market_id, outcome_id) 
                DO UPDATE SET 
                    shares = EXCLUDED.shares,
                    invested = EXCLUDED.invested,
                    updated_at = CURRENT_TIMESTAMP
            `, [row.user_id, row.market_id, row.outcome_id, row.total_shares, row.total_invested]);
        }

        console.log('Positions table populated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migratePositions();
