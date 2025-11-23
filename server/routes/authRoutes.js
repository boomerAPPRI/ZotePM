const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authenticateToken = require('../middleware/authMiddleware');

router.get('/line', authController.login);
router.get('/line/callback', authController.callback);
router.post('/register', authController.register);
router.post('/login', authController.loginEmail);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
