const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycle.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.get('/', protect, cycleController.getAllCycles);
router.get('/:id', protect, cycleController.getCycleById);
router.post('/', protect, adminOnly, upload.single('image'), cycleController.createCycle);
router.put('/:id', protect, adminOnly, upload.single('image'), cycleController.updateCycle);
router.delete('/:id', protect, adminOnly, cycleController.deleteCycle);

module.exports = router;
