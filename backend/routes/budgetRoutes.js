const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, budgetController.getBudgets);
router.post('/', auth, budgetController.setBudget);

module.exports = router;
