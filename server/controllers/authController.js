const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

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
        const result = await db.query('SELECT id, email, name, balance, role FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};

module.exports = {
    login,
    callback,
    register,
    loginEmail,
    getMe,
};
