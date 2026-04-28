const cycleRepo = require('../repositories/cycle.repository');
const { successResponse, errorResponse } = require('../utils/helper');

exports.getAllCycles = async (req, res, next) => {
  try {
    const { status, location } = req.query;
    const cycles = await cycleRepo.findAll({ status, location });
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
    const cycle = await cycleRepo.create(req.body);
    return successResponse(res, cycle, 'Cycle created', 201);
  } catch (err) { next(err); }
};

exports.updateCycle = async (req, res, next) => {
  try {
    const cycle = await cycleRepo.update(req.params.id, req.body);
    if (!cycle) return errorResponse(res, 'Cycle not found', 404);
    return successResponse(res, cycle, 'Cycle updated');
  } catch (err) { next(err); }
};
