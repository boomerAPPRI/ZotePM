class MockDB {
    constructor() {
        this.users = [
            { id: 1, line_id: 'mock_user', name: 'Mock User', balance: 1000.00 }
        ];
        this.markets = [
            {
                id: 1,
                title: 'Will AI take over the world?',
                description: 'Bet on the future of AI.',
                status: 'open',
                resolution_date: new Date(Date.now() + 86400000).toISOString(),
                outcomes: [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }],
                created_at: new Date().toISOString()
            }
        ];
        this.orders = [];
        this.transactions = [];
        this.positions = [
            { id: 1, user_id: 1, market_id: 1, outcome_id: 1, shares: 10, invested: 5.00, updated_at: new Date().toISOString() }
        ];
    }

    async query(text, params = []) {
        console.log('MockDB Query:', text, params);
        const normalizedText = text.trim().toUpperCase();

        // BEGIN/COMMIT/ROLLBACK
        if (normalizedText === 'BEGIN' || normalizedText === 'COMMIT' || normalizedText === 'ROLLBACK') {
            return { rows: [] };
        }

        // SELECT * FROM markets
        if (normalizedText.includes('SELECT * FROM MARKETS')) {
            if (normalizedText.includes('WHERE ID = $1')) {
                const market = this.markets.find(m => m.id == params[0]);
                return { rows: market ? [market] : [] };
            }
            return { rows: [...this.markets].reverse() };
        }

        // INSERT INTO markets
        if (normalizedText.startsWith('INSERT INTO MARKETS')) {
            const newMarket = {
                id: this.markets.length + 1,
                title: params[0],
                description: params[1],
                outcomes: JSON.parse(params[2]),
                resolution_date: params[3],
                status: 'open',
                created_at: new Date().toISOString()
            };
            this.markets.push(newMarket);
            return { rows: [newMarket] };
        }

        // SELECT outcomes FROM markets
        if (normalizedText.includes('SELECT OUTCOMES FROM MARKETS')) {
            const market = this.markets.find(m => m.id == params[0]);
            return { rows: market ? [{ outcomes: market.outcomes }] : [] };
        }

        // SELECT outcome_id, amount FROM orders
        if (normalizedText.includes('SELECT OUTCOME_ID, AMOUNT FROM ORDERS')) {
            const marketOrders = this.orders.filter(o => o.market_id == params[0]);
            return { rows: marketOrders };
        }

        // SELECT balance FROM users
        if (normalizedText.includes('SELECT BALANCE FROM USERS')) {
            const user = this.users.find(u => u.id == params[0]);
            return { rows: user ? [{ balance: user.balance }] : [] };
        }

        // UPDATE users SET balance
        if (normalizedText.startsWith('UPDATE USERS SET BALANCE')) {
            const userId = params[1];
            const amount = parseFloat(params[0]);
            const user = this.users.find(u => u.id == userId);
            if (user) {
                if (normalizedText.includes('BALANCE - $1')) {
                    user.balance -= amount;
                } else {
                    user.balance += amount;
                }
            }
            return { rows: [] };
        }

        // INSERT INTO orders
        if (normalizedText.startsWith('INSERT INTO ORDERS')) {
            const newOrder = {
                id: this.orders.length + 1,
                user_id: params[0],
                market_id: params[1],
                outcome_id: params[2],
                amount: params[3],
                price: params[4],
                timestamp: new Date().toISOString()
            };
            this.orders.push(newOrder);
            return { rows: [newOrder] };
        }

        // UPDATE markets SET status (Resolve)
        if (normalizedText.startsWith('UPDATE MARKETS SET STATUS')) {
            const marketId = params[1];
            const market = this.markets.find(m => m.id == marketId);
            if (market) {
                market.status = params[0];
                market.resolution_date = new Date().toISOString();
                return { rows: [market] };
            }
            return { rows: [] };
        }

        // SELECT user_id, SUM(amount) ... (Resolve)
        if (normalizedText.includes('SUM(AMOUNT) AS TOTAL_SHARES')) {
            const marketId = params[0];
            const outcomeId = params[1];
            // Group by user_id
            const totals = {};
            this.orders.filter(o => o.market_id == marketId && o.outcome_id == outcomeId).forEach(o => {
                if (!totals[o.user_id]) totals[o.user_id] = 0;
                totals[o.user_id] += parseFloat(o.amount);
            });
            const rows = Object.keys(totals).map(uid => ({ user_id: uid, total_shares: totals[uid] }));
            return { rows };
        }

        // INSERT INTO transactions
        if (normalizedText.startsWith('INSERT INTO TRANSACTIONS')) {
            this.transactions.push({
                id: this.transactions.length + 1,
                user_id: params[0],
                type: params[1],
                amount: params[2],
                timestamp: new Date().toISOString()
            });
            return { rows: [] };
        }

        // Auth: SELECT * FROM users WHERE line_id
        if (normalizedText.includes('SELECT * FROM USERS WHERE LINE_ID')) {
            const user = this.users.find(u => u.line_id === params[0]);
            return { rows: user ? [user] : [] };
        }

        // Auth: SELECT * FROM users WHERE email
        if (normalizedText.includes('SELECT * FROM USERS WHERE EMAIL')) {
            const user = this.users.find(u => u.email === params[0]);
            return { rows: user ? [user] : [] };
        }

        // Auth: INSERT INTO users (email...)
        if (normalizedText.startsWith('INSERT INTO USERS') && normalizedText.includes('EMAIL')) {
            const newUser = {
                id: this.users.length + 1,
                email: params[0],
                password_hash: params[1],
                name: params[2],
                balance: 1000.00,
                created_at: new Date().toISOString()
            };
            this.users.push(newUser);
            return { rows: [newUser] };
        }

        // SELECT positions for Leaderboard
        if (normalizedText.includes('FROM POSITIONS WHERE SHARES > 0')) {
            return { rows: this.positions.filter(p => p.shares > 0) };
        }

        // SELECT positions for Portfolio (with JOIN)
        if (normalizedText.includes('FROM POSITIONS P') && normalizedText.includes('JOIN MARKETS M')) {
            const userId = params[0];
            const userPositions = this.positions.filter(p => p.user_id == userId && p.shares > 0);
            const rows = userPositions.map(p => {
                const market = this.markets.find(m => m.id == p.market_id);
                return {
                    market_id: p.market_id,
                    market_title: market ? market.title : 'Unknown',
                    market_status: market ? market.status : 'open',
                    outcomes: market ? market.outcomes : [],
                    outcome_id: p.outcome_id,
                    shares: p.shares,
                    invested: p.invested
                };
            });
            return { rows };
        }

        // INSERT/UPDATE positions
        if (normalizedText.startsWith('INSERT INTO POSITIONS')) {
            const userId = params[0];
            const marketId = params[1];
            const outcomeId = params[2];
            const shares = parseFloat(params[3]);
            const invested = parseFloat(params[4]);

            const existing = this.positions.find(p => p.user_id == userId && p.market_id == marketId && p.outcome_id == outcomeId);
            if (existing) {
                existing.shares += shares;
                existing.invested += invested;
                existing.updated_at = new Date().toISOString();
            } else {
                this.positions.push({
                    id: this.positions.length + 1,
                    user_id: userId,
                    market_id: marketId,
                    outcome_id: outcomeId,
                    shares,
                    invested,
                    updated_at: new Date().toISOString()
                });
            }
            return { rows: [] };
        }

        // SELECT users for Leaderboard
        if (normalizedText.includes('SELECT ID, NAME, BALANCE, COUNTRY, OCCUPATION FROM USERS')) {
            return { rows: this.users };
        }

        // SELECT markets for Leaderboard
        if (normalizedText.includes('SELECT ID, OUTCOMES FROM MARKETS')) {
            return { rows: this.markets.map(m => ({ id: m.id, outcomes: m.outcomes })) };
        }

        // SELECT orders for Leaderboard/Portfolio
        if (normalizedText.includes('SELECT MARKET_ID, OUTCOME_ID, AMOUNT FROM ORDERS')) {
            if (normalizedText.includes('WHERE MARKET_ID = ANY')) {
                const marketIds = params[0];
                return { rows: this.orders.filter(o => marketIds.includes(o.market_id)) };
            }
            return { rows: this.orders };
        }

        // SELECT individual orders for Portfolio
        if (normalizedText.includes('SELECT ID, MARKET_ID, OUTCOME_ID, AMOUNT, PRICE, TIMESTAMP FROM ORDERS')) {
            const userId = params[0];
            const marketIds = params[1];
            return { rows: this.orders.filter(o => o.user_id == userId && marketIds.includes(o.market_id)) };
        }

        console.warn('MockDB: Unhandled query', text);
        return { rows: [] };
    }
}

module.exports = new MockDB();
