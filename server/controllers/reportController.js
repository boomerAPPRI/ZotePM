const db = require('../db');

const ExcelJS = require('exceljs');

const getMarketResultsReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.title as "Market Title",
                m.status as "Status",
                m.outcomes as "Market Outcomes",
                m.winner_outcome_id as "Winner Outcome ID",
                u.name as "User Name",
                u.email as "User Email",
                u.country as "Country",
                u.city as "City",
                u.age_range as "Age Range",
                u.occupation as "Occupation",
                p.outcome_id as "Outcome Predicted ID",
                p.shares as "Shares Owned",
                p.invested as "Total Invested",
                p.updated_at as "Last Updated"
            FROM positions p
            JOIN markets m ON p.market_id = m.id
            JOIN users u ON p.user_id = u.id
            WHERE p.shares > 0
            ORDER BY m.id, u.id
        `;

        const result = await db.query(query);
        const rows = result.rows;

        // Process rows to resolve outcome names from JSON
        const processedRows = rows.map(row => {
            const outcomes = row["Market Outcomes"];
            const winnerId = row["Winner Outcome ID"];
            const predictedId = row["Outcome Predicted ID"];

            const winner = outcomes.find(o => o.id == winnerId)?.name || 'N/A';
            const predicted = outcomes.find(o => o.id == predictedId)?.name || 'Unknown';

            return {
                "Market Title": row["Market Title"],
                "Status": row["Status"],
                "Winner": winner,
                "User Name": row["User Name"],
                "User Email": row["User Email"],
                "Country": row["Country"],
                "City": row["City"],
                "Age Range": row["Age Range"],
                "Occupation": row["Occupation"],
                "Outcome Predicted": predicted,
                "Shares Owned": row["Shares Owned"],
                "Total Invested": row["Total Invested"],
                "Last Updated": row["Last Updated"]
            };
        });

        if (processedRows.length === 0) {
            return res.send('No data available');
        }

        // Convert to CSV
        const headers = Object.keys(processedRows[0]).join(',');
        const csv = processedRows.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        const report = `\uFEFF${headers}\n${csv}`; // Add BOM for Excel compatibility

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('market_results_report.csv');
        res.send(report);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getFullDataDump = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const tables = ['users', 'markets', 'orders', 'transactions', 'positions'];

        for (const table of tables) {
            let query = `SELECT * FROM ${table}`;
            if (table === 'users') {
                // Exclude sensitive data
                query = 'SELECT id, line_id, email, name, role, balance, created_at, country, city, age_range, occupation FROM users';
            }
            const result = await db.query(query);
            const rows = result.rows;

            if (rows.length > 0) {
                const sheet = workbook.addWorksheet(table);
                const columns = Object.keys(rows[0]).map(key => ({ header: key, key: key }));
                sheet.columns = columns;
                sheet.addRows(rows);
            }
        }

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('full_data_dump.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getMarketResultsReport,
    getFullDataDump
};
