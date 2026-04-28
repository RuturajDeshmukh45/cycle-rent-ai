const express = require('express');
const router = express.Router();
const { getAllCycles, getCycleById, createCycle, updateCycle } = require('../controllers/cycle.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', protect, getAllCycles);
router.get('/:id', protect, getCycleById);
router.post('/', protect, adminOnly, createCycle);
router.put('/:id', protect, adminOnly, updateCycle);

module.exports = router;
