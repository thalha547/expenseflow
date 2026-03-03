const pool = require('../config/db');

exports.getExpenses = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.*, c.name as category_name 
             FROM expenses e 
             JOIN categories c ON e.category_id = c.id 
             WHERE e.user_id = ? 
             ORDER BY e.expense_date DESC`,
            [req.session.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addExpense = async (req, res) => {
    const { amount, category_id, expense_date, payment_mode, notes } = req.body;
    if (!amount || !category_id || !expense_date || !payment_mode) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await pool.query(
            `INSERT INTO expenses (user_id, category_id, amount, expense_date, payment_mode, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.session.userId, category_id, amount, expense_date, payment_mode, notes || '']
        );
        res.status(201).json({ message: 'Expense added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, category_id, expense_date, payment_mode, notes } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE expenses 
             SET amount = ?, category_id = ?, expense_date = ?, payment_mode = ?, notes = ? 
             WHERE id = ? AND user_id = ?`,
            [amount, category_id, expense_date, payment_mode, notes, id, req.session.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
