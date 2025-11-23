-- Users table
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    line_id VARCHAR(255) UNIQUE, -- Nullable for email users
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Markets table
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- open, closed, resolved
    resolution_date TIMESTAMP,
    outcomes JSONB NOT NULL, -- e.g., [{"id": 1, "name": "Yes"}, {"id": 2, "name": "No"}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    market_id INTEGER REFERENCES markets(id),
    outcome_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- deposit, withdrawal, bet, win
    amount DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrations
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
-- Set first user as admin (optional, for bootstrapping)
UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1);
