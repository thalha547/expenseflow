const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, familyController.createFamily);
router.post('/join', auth, familyController.joinFamily);
router.get('/details', auth, familyController.getFamilyDetails);
router.get('/expenses', auth, familyController.getFamilyExpenses);

module.exports = router;
