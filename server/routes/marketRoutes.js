const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const authenticateToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

router.get('/', marketController.getMarkets);
router.get('/:id', marketController.getMarket);
router.post('/', authenticateToken, requireAdmin, marketController.createMarket);
router.post('/:id/resolve', authenticateToken, requireAdmin, marketController.resolveMarket);
router.post('/:id/predict', authenticateToken, marketController.placePrediction);

module.exports = router;
