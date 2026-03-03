const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const auth = require('../middleware/authMiddleware');

router.get('/summary', auth, analysisController.getSummary);
router.get('/trends', auth, analysisController.getTrends);
router.get('/predict', auth, analysisController.getPrediction);

module.exports = router;
