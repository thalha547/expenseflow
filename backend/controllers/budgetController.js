const pool = require('../config/db');

exports.getBudgets = async (req, res) => {
    const { month, year } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT b.*, c.name as category_name, 
             (SELECT SUM(amount) FROM expenses WHERE user_id = b.user_id AND category_id = b.category_id AND MONTH(expense_date) = b.month AND YEAR(expense_date) = b.year) as spent
             FROM budgets b 
             JOIN categories c ON b.category_id = c.id 
             WHERE b.user_id = ? AND b.month = ? AND b.year = ?`,
            [req.session.userId, month, year]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.setBudget = async (req, res) => {
    const { category_id, amount, month, year } = req.body;
    try {
        await pool.query(
            `INSERT INTO budgets (user_id, category_id, amount, month, year) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
            [req.session.userId, category_id, amount, month, year]
        );
        res.json({ message: 'Budget set successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
