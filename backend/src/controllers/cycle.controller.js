const cycleRepo = require('../repositories/cycle.repository');
const { successResponse, errorResponse } = require('../utils/helper');
const fs = require('fs');
const path = require('path');

// Helper: build public URL for uploaded image
const getImageUrl = (req, filename) => {
  if (!filename) return null;
  // Returns: http://localhost:5000/uploads/cycles/filename.jpg
  return `${req.protocol}://${req.get('host')}/uploads/cycles/${filename}`;
};

// Helper: delete old local image file
const deleteLocalImage = (imageUrl) => {
  if (!imageUrl) return;
  try {
    // extract filename from URL like http://localhost:5000/uploads/cycles/cycle_xxx.jpg
    const filename = imageUrl.split('/uploads/cycles/')[1];
    if (!filename) return;
    const filePath = path.join(__dirname, '../../uploads/cycles', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // silent — don't crash if file already gone
  }
};

exports.getAllCycles = async (req, res, next) => {
  try {
    const { status, location, cycle_type } = req.query;
    const cycles = await cycleRepo.findAll({ status, location, cycle_type });
    return successResponse(res, cycles, 'Cycles fetched');
  } catch (err) { next(err); }
};

exports.getCycleById = async (req, res, next) => {
  try {
    const cycle = await cycleRepo.findById(req.params.id);
    if (!cycle) return errorResponse(res, 'Cycle not found', 404);
    return successResponse(res, cycle, 'Cycle fetched');
  } catch (err) { next(err); }
};

exports.createCycle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image_url = getImageUrl(req, req.file.filename);
    }
    const cycle = await cycleRepo.create(data);
    return successResponse(res, cycle, 'Cycle created', 201);
  } catch (err) {
    // If creation failed but file was uploaded, clean it up
    if (req.file) deleteLocalImage(getImageUrl(req, req.file.filename));
    next(err);
  }
};

exports.updateCycle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Delete old image before saving new one
      const existing = await cycleRepo.findById(req.params.id);
      if (existing?.image_url) deleteLocalImage(existing.image_url);
      data.image_url = getImageUrl(req, req.file.filename);
    }
    const cycle = await cycleRepo.update(req.params.id, data);
    if (!cycle) return errorResponse(res, 'Cycle not found', 404);
    return successResponse(res, cycle, 'Cycle updated');
  } catch (err) { next(err); }
};

exports.deleteCycle = async (req, res, next) => {
  try {
    const existing = await cycleRepo.findById(req.params.id);
    if (!existing) return errorResponse(res, 'Cycle not found', 404);
    if (existing.image_url) deleteLocalImage(existing.image_url);
    await cycleRepo.delete(req.params.id);
    return successResponse(res, null, 'Cycle deleted');
  } catch (err) { next(err); }
};
