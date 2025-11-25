const db = require('../db');
const LMSR = require('../utils/lmsr');

// Controller for market operations
const lmsr = new LMSR(100); // Default liquidity parameter

const getMarkets = async (req, res) => {
    try {
        const { all } = req.query;
        let query = 'SELECT * FROM markets';
        const params = [];

        if (all !== 'true') {
            query += " WHERE status != 'archived'";
        }

        query += ' ORDER BY created_at DESC';

        const marketsResult = await db.query(query, params);
        const markets = marketsResult.rows;

        // Fetch all orders to calculate prices and volume
        // Optimization: In a real app, we might cache this or use a materialized view
        const ordersResult = await db.query('SELECT market_id, outcome_id, amount, price FROM orders');
        const orders = ordersResult.rows;

        const marketsWithPrices = markets.map(market => {
            const currentQuantities = new Array(market.outcomes.length).fill(0);
            let volume = 0;

            // Filter orders for this market
            const marketOrders = orders.filter(o => o.market_id === market.id);

            marketOrders.forEach(order => {
                const index = market.outcomes.findIndex(o => o.id === order.outcome_id);
                if (index !== -1) {
                    currentQuantities[index] += parseFloat(order.amount);
                }
                volume += parseFloat(order.price);
            });

            const prices = market.outcomes.map((_, index) => lmsr.calculatePrice(currentQuantities, index));

            return {
                ...market,
                volume,
                outcomes: market.outcomes.map((o, i) => ({
                    ...o,
                    price: prices[i],
                    quantity: currentQuantities[i]
                }))
            };
        });

        res.json(marketsWithPrices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const marketResult = await db.query('SELECT * FROM markets WHERE id = $1', [id]);
        if (marketResult.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }
        const market = marketResult.rows[0];

        // Calculate current prices and volume
        const ordersResult = await db.query('SELECT outcome_id, amount, price FROM orders WHERE market_id = $1', [id]);
        const currentQuantities = new Array(market.outcomes.length).fill(0);
        let volume = 0;

        ordersResult.rows.forEach(order => {
            const index = market.outcomes.findIndex(o => o.id === order.outcome_id);
            if (index !== -1) {
                currentQuantities[index] += parseFloat(order.amount);
            }
            volume += parseFloat(order.price);
        });

        const prices = market.outcomes.map((_, index) => lmsr.calculatePrice(currentQuantities, index));

        // Attach prices to outcomes
        market.outcomes = market.outcomes.map((o, i) => ({
            ...o,
            price: prices[i],
            quantity: currentQuantities[i]
        }));
        market.volume = volume;

        res.json(market);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const createMarket = async (req, res) => {
    const { title, description, outcomes, resolution_date, resolution_criteria, type } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO markets (title, description, outcomes, resolution_date, resolution_criteria, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, JSON.stringify(outcomes), resolution_date, resolution_criteria, type || 'binary']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const resolveMarket = async (req, res) => {
    const { id } = req.params;
    const { outcomeId } = req.body;

    try {
        await db.query('BEGIN');

        // 1. Update market status
        const marketResult = await db.query('UPDATE markets SET status = $1, resolution_date = NOW(), winner_outcome_id = $2 WHERE id = $3 RETURNING *', ['resolved', outcomeId, id]);
        if (marketResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Market not found' });
        }

        // 2. Payout winners
        // Simple payout: 1 share of winning outcome = 1 token. Losing shares = 0.
        // We need to find all orders for this market and winning outcome? 
        // No, we need to know final holdings. 
        // For MVP, we can sum up orders per user for the winning outcome.

        const ordersResult = await db.query('SELECT user_id, SUM(amount) as total_shares FROM orders WHERE market_id = $1 AND outcome_id = $2 GROUP BY user_id', [id, outcomeId]);

        for (const row of ordersResult.rows) {
            const payout = parseFloat(row.total_shares); // 1 token per share
            if (payout > 0) {
                await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [payout, row.user_id]);
                await db.query('INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)', [row.user_id, 'win', payout]);
            }
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Market resolved' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const placeBet = async (req, res) => {
    const { id } = req.params;
    const { outcomeId, amount } = req.body; // amount is shares to buy
    const userId = req.user.id;
    console.log('Place Prediction Request:', { id, outcomeId, amount, userId });

    try {
        // 1. Get market and current quantities
        const ordersResult = await db.query('SELECT outcome_id, amount FROM orders WHERE market_id = $1', [id]);
        const marketResult = await db.query('SELECT outcomes FROM markets WHERE id = $1', [id]);

        if (marketResult.rows.length === 0) return res.status(404).json({ error: 'Market not found' });

        const outcomes = marketResult.rows[0].outcomes;
        const currentQuantities = new Array(outcomes.length).fill(0);

        ordersResult.rows.forEach(order => {
            const index = outcomes.findIndex(o => o.id === order.outcome_id);
            if (index !== -1) {
                currentQuantities[index] += parseFloat(order.amount);
            }
        });

        const outcomeIndex = outcomes.findIndex(o => o.id == outcomeId); // Loose equality for string/number match
        if (outcomeIndex === -1) {
            console.error('Invalid outcome ID:', outcomeId, 'Available:', outcomes.map(o => o.id));
            return res.status(400).json({ error: 'Invalid outcome ID' });
        }

        // 2. Calculate cost
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const cost = lmsr.calculateTradeCost(currentQuantities, outcomeIndex, amountNum);

        // 3. Check user balance
        const userResult = await db.query('SELECT balance FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        if (userResult.rows[0].balance < cost) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 4. Create order and update balance
        await db.query('BEGIN');
        await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [cost, userId]);
        await db.query(
            'INSERT INTO orders (user_id, market_id, outcome_id, amount, price) VALUES ($1, $2, $3, $4, $5)',
            [userId, id, outcomeId, amountNum, cost]
        );
        await db.query(
            'INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)',
            [userId, 'bet', cost]
        );

        // Update positions table (Upsert)
        await db.query(`
            INSERT INTO positions (user_id, market_id, outcome_id, shares, invested)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, market_id, outcome_id)
            DO UPDATE SET 
                shares = positions.shares + EXCLUDED.shares,
                invested = positions.invested + EXCLUDED.invested,
                updated_at = CURRENT_TIMESTAMP
        `, [userId, id, outcomeId, amountNum, cost]);

        await db.query('COMMIT');

        res.json({ success: true, cost, shares: amountNum });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMarketHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const marketResult = await db.query('SELECT * FROM markets WHERE id = $1', [id]);
        if (marketResult.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }
        const market = marketResult.rows[0];

        // Fetch all orders ordered by timestamp
        const ordersResult = await db.query('SELECT outcome_id, amount, timestamp FROM orders WHERE market_id = $1 ORDER BY timestamp ASC', [id]);
        const orders = ordersResult.rows;

        const history = [];
        const currentQuantities = new Array(market.outcomes.length).fill(0);

        // Initial state at creation time
        const initialPrices = market.outcomes.map((_, index) => lmsr.calculatePrice(currentQuantities, index));
        history.push({
            timestamp: market.created_at,
            prices: market.outcomes.reduce((acc, outcome, index) => {
                acc[outcome.name] = initialPrices[index];
                return acc;
            }, {})
        });

        orders.forEach(order => {
            const index = market.outcomes.findIndex(o => o.id === order.outcome_id);
            if (index !== -1) {
                currentQuantities[index] += parseFloat(order.amount);

                const prices = market.outcomes.map((_, i) => lmsr.calculatePrice(currentQuantities, i));

                history.push({
                    timestamp: order.timestamp,
                    prices: market.outcomes.reduce((acc, outcome, i) => {
                        acc[outcome.name] = prices[i];
                        return acc;
                    }, {})
                });
            }
        });

        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};



const updateMarket = async (req, res) => {
    const { id } = req.params;
    const { title, description, resolution_date, resolution_criteria } = req.body;

    try {
        const result = await db.query(
            'UPDATE markets SET title = $1, description = $2, resolution_date = $3, resolution_criteria = $4 WHERE id = $5 RETURNING *',
            [title, description, resolution_date, resolution_criteria, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteMarket = async (req, res) => {
    const { id } = req.params;

    try {
        // Soft delete: set status to 'archived'
        const result = await db.query(
            "UPDATE markets SET status = 'archived' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }

        res.json({ message: 'Market archived successfully', market: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const unarchiveMarket = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            "UPDATE markets SET status = 'open' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Market not found' });
        }

        res.json({ message: 'Market unarchived successfully', market: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getMarkets,
    getMarket,
    createMarket,
    placePrediction: placeBet,
    resolveMarket,
    getMarketHistory,
    updateMarket,
    deleteMarket,
    unarchiveMarket
};
