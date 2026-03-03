const pool = require('../config/db');
const crypto = require('crypto');

// Create a new family
exports.createFamily = async (req, res) => {
    const { name } = req.body;
    const adminId = req.session.userId;
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Family
        const [result] = await connection.query(
            'INSERT INTO families (name, admin_id, invite_code) VALUES (?, ?, ?)',
            [name, adminId, inviteCode]
        );
        const familyId = result.insertId;

        // 2. Add creator as Admin member
        await connection.query(
            'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
            [familyId, adminId, 'Admin']
        );

        await connection.commit();
        res.status(201).json({ message: 'Family created successfully', inviteCode, familyId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Error creating family', error: error.message });
    } finally {
        connection.release();
    }
};

// Join a family via invite code
exports.joinFamily = async (req, res) => {
    const { inviteCode } = req.body;
    const userId = req.session.userId;

    try {
        const [families] = await pool.query('SELECT id FROM families WHERE invite_code = ?', [inviteCode]);
        if (families.length === 0) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        const familyId = families[0].id;

        await pool.query(
            'INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)',
            [familyId, userId, 'Member']
        );

        res.json({ message: 'Joined family successfully', familyId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'You are already a member of this family' });
        }
        res.status(500).json({ message: 'Error joining family', error: error.message });
    }
};

// Get family details and members
exports.getFamilyDetails = async (req, res) => {
    const userId = req.session.userId;

    try {
        // Find which family the user belongs to
        const [membership] = await pool.query(
            `SELECT f.*, fm.role 
             FROM families f 
             JOIN family_members fm ON f.id = fm.family_id 
             WHERE fm.user_id = ?`,
            [userId]
        );

        if (membership.length === 0) {
            return res.json({ inFamily: false });
        }

        const family = membership[0];

        // Get all members
        const [members] = await pool.query(
            `SELECT u.username, u.email, fm.role, fm.joined_at 
             FROM users u 
             JOIN family_members fm ON u.id = fm.user_id 
             WHERE fm.family_id = ?`,
            [family.id]
        );

        res.json({
            inFamily: true,
            family: {
                id: family.id,
                name: family.name,
                inviteCode: family.invite_code,
                myRole: family.role
            },
            members
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching family details', error: error.message });
    }
};

// Get family-wide expenses
exports.getFamilyExpenses = async (req, res) => {
    const userId = req.session.userId;

    try {
        const [membership] = await pool.query('SELECT family_id FROM family_members WHERE user_id = ?', [userId]);
        if (membership.length === 0) {
            return res.status(403).json({ message: 'Not a member of any family' });
        }
        const familyId = membership[0].family_id;

        const [expenses] = await pool.query(
            `SELECT e.*, c.name as category_name, u.username as spent_by 
             FROM expenses e 
             JOIN categories c ON e.category_id = c.id 
             JOIN users u ON e.user_id = u.id 
             WHERE e.user_id IN (SELECT user_id FROM family_members WHERE family_id = ?)
             ORDER BY e.expense_date DESC`,
            [familyId]
        );

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching family expenses', error: error.message });
    }
};
