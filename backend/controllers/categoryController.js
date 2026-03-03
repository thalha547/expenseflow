const pool = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM categories WHERE is_preset = TRUE OR user_id = ?',
            [req.session.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    try {
        await pool.query(
            'INSERT INTO categories (name, user_id) VALUES (?, ?)',
            [name, req.session.userId]
        );
        res.status(201).json({ message: 'Category added' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
