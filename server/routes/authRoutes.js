const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/line', authController.login);
router.get('/line/callback', authController.callback);
router.post('/register', authController.register);
router.post('/login', authController.loginEmail);
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/transactions', authenticateToken, authController.getTransactions);
router.get('/portfolio', authenticateToken, authController.getPortfolio);

// Admin Routes
const { requireAdmin } = require('../middleware/authMiddleware');
router.get('/users', authenticateToken, requireAdmin, authController.getUsers);
router.get('/users/:id/export', authenticateToken, requireAdmin, authController.exportUserData);

// Debug/Testing: Reset Profile Reward
router.post('/reset-reward', authenticateToken, authController.resetProfileReward);

module.exports = router;
