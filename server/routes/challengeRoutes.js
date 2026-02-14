const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/leaderboard', challengeController.getChallengeLeaderboard);

// Admin routes
router.post('/', authenticateToken, requireAdmin, challengeController.createChallenge);
router.put('/:id', authenticateToken, requireAdmin, challengeController.updateChallenge);
router.put('/:id/archive', authenticateToken, requireAdmin, challengeController.archiveChallenge);

module.exports = router;
