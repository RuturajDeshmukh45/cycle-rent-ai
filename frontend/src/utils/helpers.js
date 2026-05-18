export const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;
export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const getStatusColor = (status) => {
  const map = { available: 'green', booked: 'red', maintenance: 'yellow', active: 'blue', completed: 'gray', cancelled: 'red' };
  return map[status] || 'gray';
};
export const getCycleTypeIcon = (type) => {
  const map = { standard: '🚲', electric: '⚡', mountain: '🏔️' };
  return map[type] || '🚲';
};
