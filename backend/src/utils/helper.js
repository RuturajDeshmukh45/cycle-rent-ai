const calculateCost = (startTime, endTime, pricePerHour) => {
  const diff = new Date(endTime) - new Date(startTime);
  const hours = diff / (1000 * 60 * 60);
  return parseFloat((hours * pricePerHour).toFixed(2));
};

const getDurationHours = (startTime, endTime) => {
  const diff = new Date(endTime) - new Date(startTime);
  return parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
};

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, message = 'Error', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { calculateCost, getDurationHours, successResponse, errorResponse };
