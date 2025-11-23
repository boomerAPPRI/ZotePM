const db = require('../db');

const requireAdmin = async (req, res, next) => {
    try {
        // req.user is populated by authenticateToken middleware
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch user role from DB to be safe (or trust token if short-lived)
        // For now, let's fetch from DB to ensure up-to-date role
        const result = await db.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        next();
    } catch (err) {
        console.error('Admin check failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = requireAdmin;
