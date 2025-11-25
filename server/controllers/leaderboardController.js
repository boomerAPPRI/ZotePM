const db = require('../db');
const LMSR = require('../utils/lmsr');
const lmsr = new LMSR(100);

const getLeaderboard = async (req, res) => {
    const limit = parseInt(req.query.limit) || 200;
    try {
        // 1. Fetch all users
        const usersResult = await db.query('SELECT id, name, balance, country, occupation FROM users');
        const users = usersResult.rows;

        // 2. Fetch all markets and orders to calculate current prices
        // Optimization: Cache current prices in markets table to avoid this step
        const marketsResult = await db.query('SELECT id, outcomes FROM markets');
        const markets = marketsResult.rows;
        const ordersResult = await db.query('SELECT market_id, outcome_id, amount FROM orders');
        const orders = ordersResult.rows;

        // 3. Calculate current prices for all markets
        const marketPrices = new Map(); // marketId -> [price0, price1, ...]

        markets.forEach(market => {
            const marketOrders = orders.filter(o => o.market_id === market.id);
            const currentQuantities = new Array(market.outcomes.length).fill(0);
            marketOrders.forEach(o => {
                const idx = market.outcomes.findIndex(out => out.id === o.outcome_id);
                if (idx !== -1) currentQuantities[idx] += parseFloat(o.amount);
            });
            const prices = market.outcomes.map((_, i) => lmsr.calculatePrice(currentQuantities, i));
            marketPrices.set(market.id, { outcomes: market.outcomes, prices });
        });

        // 4. Fetch all positions (Fast read)
        const positionsResult = await db.query('SELECT user_id, market_id, outcome_id, shares FROM positions WHERE shares > 0');
        const positions = positionsResult.rows;

        // 5. Calculate total value for each user
        const leaderboard = users.map(user => {
            let portfolioValue = 0;
            const userPositions = positions.filter(p => p.user_id === user.id);

            userPositions.forEach(pos => {
                const marketData = marketPrices.get(pos.market_id);
                if (marketData) {
                    const outcomeIndex = marketData.outcomes.findIndex(o => o.id === pos.outcome_id);
                    if (outcomeIndex !== -1) {
                        const price = marketData.prices[outcomeIndex];
                        portfolioValue += parseFloat(pos.shares) * price;
                    }
                }
            });

            return {
                ...user,
                totalValue: parseFloat(user.balance) + portfolioValue,
                balance: parseFloat(user.balance),
                portfolioValue: portfolioValue
            };
        });

        // 6. Sort by total value and slice
        leaderboard.sort((a, b) => b.totalValue - a.totalValue);
        res.json(leaderboard.slice(0, limit));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getLeaderboard,
};
