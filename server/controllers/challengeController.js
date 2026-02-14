const db = require('../db');
const LMSR = require('../utils/lmsr');
const lmsr = new LMSR(100);

// Get all challenges (Public: only active)
const getChallenges = async (req, res) => {
    try {
        const { includeArchived } = req.query;
        let query = "SELECT * FROM challenges";

        // If not requesting archived (admin likely), default to active only
        if (includeArchived !== 'true') {
            query += " WHERE is_active = true";
        }

        query += " ORDER BY end_date ASC";

        const result = await db.query(query);
        const challenges = result.rows;

        // Populate market summaries (limit 4)
        const challengesWithMarkets = await Promise.all(challenges.map(async (challenge) => {
            let markets = [];
            if (challenge.market_ids && challenge.market_ids.length > 0) {
                const marketIds = challenge.market_ids.slice(0, 4).map(Number).filter(n => !isNaN(n));
                if (marketIds.length > 0) {
                    const marketsResult = await db.query(
                        'SELECT id, title, status FROM markets WHERE id = ANY($1)',
                        [marketIds]
                    );
                    markets = marketsResult.rows;
                }
            }
            return { ...challenge, markets };
        }));

        res.json(challengesWithMarkets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create a new challenge (Admin only)
const createChallenge = async (req, res) => {
    const { title, description, start_date, end_date, market_ids } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO challenges (title, description, start_date, end_date, market_ids) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, start_date, end_date, JSON.stringify(market_ids || [])]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update a challenge (Admin only)
const updateChallenge = async (req, res) => {
    const { id } = req.params;
    const { title, description, start_date, end_date, market_ids, is_active } = req.body;
    try {
        const result = await db.query(
            `UPDATE challenges 
             SET title = $1, description = $2, start_date = $3, end_date = $4, market_ids = $5, is_active = COALESCE($6, is_active)
             WHERE id = $7 RETURNING *`,
            [title, description, start_date, end_date, JSON.stringify(market_ids || []), is_active, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Challenge not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Archive a challenge (Admin only)
const archiveChallenge = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            "UPDATE challenges SET is_active = false WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Challenge not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Calculate Leaderboard for a specific challenge
const getChallengeLeaderboard = async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    try {
        // 1. Get Challenge Details
        const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [id]);
        if (challengeResult.rows.length === 0) return res.status(404).json({ error: 'Challenge not found' });
        const challenge = challengeResult.rows[0];

        // 2. Fetch Relevant Orders (Bets)
        let ordersQuery = `
            SELECT o.user_id, o.market_id, o.outcome_id, o.amount, o.price, o.timestamp 
            FROM orders o
            WHERE o.timestamp BETWEEN $1 AND $2
        `;
        const queryParams = [challenge.start_date, challenge.end_date];

        if (challenge.market_ids && challenge.market_ids.length > 0) {
            // Ensure IDs are integers
            const marketIds = challenge.market_ids.map(Number).filter(n => !isNaN(n));
            ordersQuery += ` AND o.market_id = ANY($3)`;
            queryParams.push(marketIds);
        }

        const ordersResult = await db.query(ordersQuery, queryParams);
        const orders = ordersResult.rows;

        // 3. Fetch Relevant Payouts (Wins) - for Resolved Markets
        // We need to check transactions table for type='win' 
        // BUT transactions don't link to market_id directly, only user_id.
        // We must infer from 'orders' which markets were bet on, 
        // or check 'markets' table for resolved status and manually calculate what the payout *should* have been
        // or rely on the fact that we can't easily link a generic 'win' transaction to a specific challenge without market_id in transaction.
        // 
        // BETTER APPROACH: 
        // Calculate "Realized Profit" by checking resolved markets directly.
        // If a market in the challenge is resolved, we calculate what the user *won* based on their holdings.
        // But `orders` table gives us the *entry* into the position.
        // The `positions` table gives current holding.
        // If market is resolved, `positions` might be stale or cleared? 
        // Let's assume `positions` stays for record, or we reconstruct from orders.
        // 
        // SIMPLIFIED LOGIC:
        // Profit = (Value of Holdings) - (Cost of Bets)
        // Value of Holdings:
        //   - If Market Open: Current Price * Shares
        //   - If Market Resolved: 
        //       - If Winning Outcome: 1 * Shares (assuming 1 token payout) & User held it?
        //       - If Losing Outcome: 0

        if (orders.length === 0) return res.json([]);

        const distinctMarketIds = [...new Set(orders.map(o => o.market_id))];
        const marketsResult = await db.query('SELECT id, outcomes, status, winner_outcome_id, resolution_criteria FROM markets WHERE id = ANY($1)', [distinctMarketIds]);
        const markets = marketsResult.rows;
        const marketsMap = new Map(markets.map(m => [m.id, m]));

        // Calculate Current Prices for OPEN markets only
        const marketPrices = new Map();

        // We need ALL orders for these markets to calc price, not just challenge orders
        const allOrdersResult = await db.query('SELECT market_id, outcome_id, amount FROM orders WHERE market_id = ANY($1)', [distinctMarketIds]);
        const allOrders = allOrdersResult.rows;

        markets.forEach(market => {
            if (market.status !== 'resolved') {
                const marketOrders = allOrders.filter(o => o.market_id === market.id);
                const currentQuantities = new Array(market.outcomes.length).fill(0);
                marketOrders.forEach(o => {
                    const idx = market.outcomes.findIndex(out => out.id === o.outcome_id);
                    if (idx !== -1) currentQuantities[idx] += parseFloat(o.amount);
                });
                const prices = market.outcomes.map((_, i) => lmsr.calculatePrice(currentQuantities, i));
                marketPrices.set(market.id, { outcomes: market.outcomes, prices });
            }
        });

        const userPerformance = new Map(); // userId -> { totalCost, currentValue }

        orders.forEach(order => {
            if (!userPerformance.has(order.user_id)) {
                userPerformance.set(order.user_id, { totalCost: 0, currentValue: 0 });
            }
            const stats = userPerformance.get(order.user_id);
            const market = marketsMap.get(order.market_id);

            // Add Cost (Investment)
            stats.totalCost += parseFloat(order.price);

            // Add Current Value (Revenue)
            if (market.status === 'resolved') {
                // If resolved, value is 1 if they bought the winner, 0 otherwise.
                // NOTE: This assumes they held until end. 
                // Since there is no "Sell", they MUST have held until end.
                if (String(order.outcome_id) === String(market.winner_outcome_id)) {
                    stats.currentValue += parseFloat(order.amount) * 1; // 1 token per share
                } else {
                    stats.currentValue += 0;
                }
            } else {
                // If open, use current market price (Unrealized Gains)
                const marketPriceData = marketPrices.get(order.market_id);
                if (marketPriceData) {
                    const outcomeIndex = marketPriceData.outcomes.findIndex(o => o.id === order.outcome_id);
                    if (outcomeIndex !== -1) {
                        const price = marketPriceData.prices[outcomeIndex];
                        stats.currentValue += parseFloat(order.amount) * price;
                    }
                }
            }
        });

        // 6. Format and Sort Leaderboard
        const leaderboard = [];
        const userIds = Array.from(userPerformance.keys());

        if (userIds.length > 0) {
            const usersResult = await db.query('SELECT id, name, country, occupation FROM users WHERE id = ANY($1)', [userIds]);
            const usersMap = new Map(usersResult.rows.map(u => [u.id, u]));

            userIds.forEach(userId => {
                const stats = userPerformance.get(userId);
                const user = usersMap.get(userId);
                const profit = stats.currentValue - stats.totalCost;

                if (user) {
                    leaderboard.push({
                        id: user.id,
                        name: user.name,
                        country: user.country,
                        occupation: user.occupation,
                        profit: profit,
                        trades: orders.filter(o => o.user_id === userId).length,
                        totalCost: stats.totalCost,
                        currentValue: stats.currentValue
                    });
                }
            });
        }

        // Sort by Profit DESC
        leaderboard.sort((a, b) => b.profit - a.profit);

        res.json(leaderboard.slice(0, limit));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a single challenge by ID with market details
const getChallengeById = async (req, res) => {
    const { id } = req.params;
    try {
        const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [id]);
        if (challengeResult.rows.length === 0) return res.status(404).json({ error: 'Challenge not found' });

        const challenge = challengeResult.rows[0];
        let markets = [];

        if (challenge.market_ids && challenge.market_ids.length > 0) {
            const marketIds = challenge.market_ids.map(Number).filter(n => !isNaN(n));
            const marketsResult = await db.query(
                'SELECT id, title, status, resolution_date as end_date FROM markets WHERE id = ANY($1)',
                [marketIds]
            );
            markets = marketsResult.rows;
        }

        res.json({ ...challenge, markets });
    } catch (err) {
        console.error('Error in getChallengeById:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

module.exports = {
    getChallenges,
    createChallenge,
    updateChallenge,
    archiveChallenge,
    getChallengeLeaderboard,
    getChallengeById
};
