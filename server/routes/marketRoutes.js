const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const db = require('../db');

router.get('/', marketController.getMarkets);
router.get('/:id', marketController.getMarket);
router.get('/:id/history', marketController.getMarketHistory);
router.post('/', authenticateToken, requireAdmin, marketController.createMarket);
router.post('/:id/resolve', authenticateToken, requireAdmin, marketController.resolveMarket);
router.post('/:id/predict', authenticateToken, marketController.placePrediction);
router.put('/:id', authenticateToken, requireAdmin, marketController.updateMarket);
router.delete('/:id', authenticateToken, requireAdmin, marketController.deleteMarket);
router.put('/:id/unarchive', authenticateToken, requireAdmin, marketController.unarchiveMarket);

// Temporary route to promote a user to admin
router.get('/promote/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await db.query("UPDATE users SET role = 'admin' WHERE email = $1 RETURNING *", [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: `User ${email} promoted to admin`, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const reportController = require('../controllers/reportController');
router.get('/admin/reports/market-results', authenticateToken, requireAdmin, reportController.getMarketResultsReport);
router.get('/admin/reports/full-dump', authenticateToken, requireAdmin, reportController.getFullDataDump);

module.exports = router;
