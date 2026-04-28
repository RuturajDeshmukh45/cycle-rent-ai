const express = require('express');
const router = express.Router();
const { getDynamicPricing, getRecommendations, getAnalytics } = require('../controllers/ai.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/pricing', protect, getDynamicPricing);
router.get('/recommendations', protect, getRecommendations);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
