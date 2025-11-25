const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const crypto = require('crypto');
const LMSR = require('../utils/lmsr');
const lmsr = new LMSR(100);

const LINE_AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

const login = (req, res) => {
    if (process.env.USE_MOCK_DB === 'true') {
        return res.redirect(`http://localhost:3001/auth/line/callback?code=mock_code&state=mock_state`);
    }

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINE_CHANNEL_ID,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        state: 'random_state_string', // Should be randomized and verified
        scope: 'profile openid',
    });
    res.redirect(`${LINE_AUTH_URL}?${params.toString()}`);
};

const callback = async (req, res) => {
    const { code, state } = req.query;

    try {
        let userId, displayName;

        if (process.env.USE_MOCK_DB === 'true') {
            userId = 'mock_user';
            displayName = 'Mock User';
        } else {
            // 1. Exchange code for access token
            const tokenResponse = await axios.post(
                LINE_TOKEN_URL,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: process.env.LINE_CALLBACK_URL,
                    client_id: process.env.LINE_CHANNEL_ID,
                    client_secret: process.env.LINE_CHANNEL_SECRET,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            const { access_token } = tokenResponse.data;

            // 2. Get user profile
            const profileResponse = await axios.get(LINE_PROFILE_URL, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            userId = profileResponse.data.userId;
            displayName = profileResponse.data.displayName;
        }

        // 3. Find or create user
        let userResult = await db.query('SELECT * FROM users WHERE line_id = $1', [userId]);

        if (userResult.rows.length === 0) {
            userResult = await db.query(
                'INSERT INTO users (line_id, name, balance) VALUES ($1, $2, $3) RETURNING *',
                [userId, displayName, 1000.00] // Initial balance
            );
        }

        const user = userResult.rows[0];

        // 4. Issue JWT
        const token = jwt.sign({ id: user.id, lineId: user.line_id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
        });

        // Redirect to client with token
        res.redirect(`http://localhost:5173/login/callback?token=${token}`);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, name, balance, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, name, 1000.00, 'user']
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const loginEmail = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

const getMe = async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, name, balance, role, country, city, age_range, occupation FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};

const updateProfile = async (req, res) => {
    const { country, city, age_range, occupation } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET country = $1, city = $2, age_range = $3, occupation = $4 WHERE id = $5 RETURNING *',
            [country, city, age_range, occupation, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await db.query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', [token, expires, email]);

        // In a real app, send email here. For MVP, log to console.
        console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);

        res.json({ message: 'Password reset email sent (check console)' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
        if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, userResult.rows[0].id]);

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        if (!user.password_hash) return res.status(400).json({ error: 'No password set (Line login user?)' });

        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getTransactions = async (req, res) => {
    try {
        // 1. Fetch standard transactions (deposits, withdrawals, wins)
        const transactionsResult = await db.query("SELECT * FROM transactions WHERE user_id = $1 AND type != 'bet'", [req.user.id]);
        const transactions = transactionsResult.rows.map(t => ({
            ...t,
            category: 'transaction'
        }));

        // 2. Fetch orders (bets) with market info
        const ordersResult = await db.query(`
            SELECT o.id, o.user_id, o.market_id, o.outcome_id, o.amount, o.price, o.timestamp,
                   m.title as market_title, m.outcomes
            FROM orders o
            JOIN markets m ON o.market_id = m.id
            WHERE o.user_id = $1
        `, [req.user.id]);

        const orders = ordersResult.rows.map(o => {
            const outcomeName = o.outcomes.find(out => out.id === o.outcome_id)?.name || 'Unknown';
            return {
                id: `order-${o.id}`, // Unique ID for frontend key
                user_id: o.user_id,
                type: 'bet',
                amount: o.price, // Cost of the bet
                timestamp: o.timestamp,
                category: 'order',
                marketTitle: o.market_title,
                outcomeName: outcomeName,
                shares: o.amount, // Number of shares
                pricePerShare: parseFloat(o.price) / parseFloat(o.amount)
            };
        });

        // 3. Merge and sort
        const allActivity = [...transactions, ...orders].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(allActivity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPortfolio = async (req, res) => {
    try {
        // 1. Fetch user's positions (Fast read)
        const positionsResult = await db.query(`
            SELECT 
                p.market_id, 
                m.title as market_title, 
                m.status as market_status,
                m.outcomes,
                p.outcome_id, 
                p.shares, 
                p.invested
            FROM positions p
            JOIN markets m ON p.market_id = m.id
            WHERE p.user_id = $1 AND p.shares > 0
            ORDER BY p.market_id, p.outcome_id
        `, [req.user.id]);

        const positions = positionsResult.rows;
        if (positions.length === 0) return res.json([]);

        // 2. Fetch all orders for the markets involved to calculate current prices (Still needed for price)
        // Optimization: In a real high-scale app, current prices would be cached in Redis or the markets table.
        const marketIds = [...new Set(positions.map(p => p.market_id))];
        const allOrdersResult = await db.query('SELECT market_id, outcome_id, amount FROM orders WHERE market_id = ANY($1)', [marketIds]);
        const allOrders = allOrdersResult.rows;

        // 3. Fetch user's individual orders for detail view
        const userOrdersResult = await db.query(`
            SELECT id, market_id, outcome_id, amount, price, timestamp 
            FROM orders 
            WHERE user_id = $1 AND market_id = ANY($2)
            ORDER BY timestamp DESC
        `, [req.user.id, marketIds]);
        const userOrders = userOrdersResult.rows;

        // 4. Construct Portfolio Response
        const portfolio = [];
        const marketMap = new Map();

        for (const pos of positions) {
            if (!marketMap.has(pos.market_id)) {
                // Calculate current prices
                const marketOrders = allOrders.filter(o => o.market_id === pos.market_id);
                const currentQuantities = new Array(pos.outcomes.length).fill(0);
                marketOrders.forEach(o => {
                    const idx = pos.outcomes.findIndex(out => out.id === o.outcome_id);
                    if (idx !== -1) currentQuantities[idx] += parseFloat(o.amount);
                });
                const prices = pos.outcomes.map((_, i) => lmsr.calculatePrice(currentQuantities, i));

                marketMap.set(pos.market_id, {
                    marketId: pos.market_id,
                    marketTitle: pos.market_title,
                    marketStatus: pos.market_status,
                    outcomes: [],
                    prices: prices
                });
                portfolio.push(marketMap.get(pos.market_id));
            }

            const marketEntry = marketMap.get(pos.market_id);
            const outcomeObj = pos.outcomes.find(o => o.id === pos.outcome_id);
            const outcomeIndex = pos.outcomes.findIndex(o => o.id === pos.outcome_id);
            const currentPrice = marketEntry.prices[outcomeIndex];

            // Filter orders for this specific position
            const specificOrders = userOrders.filter(o => o.market_id === pos.market_id && o.outcome_id === pos.outcome_id).map(o => ({
                id: o.id,
                shares: parseFloat(o.amount),
                invested: parseFloat(o.price),
                timestamp: o.timestamp
            }));

            marketEntry.outcomes.push({
                outcomeId: pos.outcome_id,
                outcomeName: outcomeObj ? outcomeObj.name : 'Unknown',
                currentPrice: currentPrice,
                totalShares: parseFloat(pos.shares),
                totalInvested: parseFloat(pos.invested),
                averageCost: parseFloat(pos.invested) / parseFloat(pos.shares),
                orders: specificOrders
            });
        }

        res.json(portfolio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    login,
    callback,
    register,
    loginEmail,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    getTransactions,
    getPortfolio,
};
