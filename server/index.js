const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Disable caching for API routes
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { getMarketResultsReport, getFullDataDump } = require('./controllers/reportController');
const { submitFeedback, getFeedback, getFeedbackStatus, toggleFeedbackStatus } = require('./controllers/feedbackController');
const { authenticateToken, requireAdmin } = require('./middleware/authMiddleware');

app.use('/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Report Routes
app.get('/api/admin/reports/market-results', authenticateToken, requireAdmin, getMarketResultsReport);
app.get('/api/admin/reports/full-dump', authenticateToken, requireAdmin, getFullDataDump);

// Feedback Routes
app.get('/api/feedback/status', getFeedbackStatus);
app.post('/api/feedback', authenticateToken, submitFeedback);
app.get('/api/admin/feedback', authenticateToken, requireAdmin, getFeedback);
app.post('/api/admin/feedback/toggle', authenticateToken, requireAdmin, toggleFeedbackStatus);

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const runMigrations = require('./run_migrations');

// Run migrations then start server
runMigrations().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // process.exit(1); // Don't exit immediately, let logging flush? 
    // Actually on App Engine, exiting is better so it restarts.
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
