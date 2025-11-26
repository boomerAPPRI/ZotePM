const { pool } = require('../db');

const submitFeedback = async (req, res) => {
    const { type, description, screenshot_url, metadata } = req.body;
    const userId = req.user ? req.user.id : null;

    try {
        const result = await pool.query(
            'INSERT INTO feedback (user_id, type, description, screenshot_url, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, type, description, screenshot_url, metadata]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

const getFeedback = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, u.name as user_name, u.email as user_email 
            FROM feedback f 
            LEFT JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

const getFeedbackStatus = async (req, res) => {
    try {
        const result = await pool.query("SELECT value FROM system_settings WHERE key = 'feedback_enabled'");
        const enabled = result.rows.length > 0 ? result.rows[0].value === 'true' : false;
        res.json({ enabled });
    } catch (error) {
        console.error('Error fetching feedback status:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
};

const toggleFeedbackStatus = async (req, res) => {
    const { enabled } = req.body;
    try {
        await pool.query(
            "INSERT INTO system_settings (key, value) VALUES ('feedback_enabled', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
            [enabled.toString()]
        );
        res.json({ message: 'Feedback status updated', enabled });
    } catch (error) {
        console.error('Error toggling feedback status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

module.exports = {
    submitFeedback,
    getFeedback,
    getFeedbackStatus,
    toggleFeedbackStatus
};
