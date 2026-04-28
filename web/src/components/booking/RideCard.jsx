import { formatCurrency, formatDate, formatTime, formatDuration } from '../../utils/helpers';
import { getCycleTypeIcon } from '../../utils/helpers';
import Button from '../comman/Button';

const statusColors = {
  booked: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const RideCard = ({ booking, onComplete, onCancel }) => {
  const cycle = booking.cycle;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getCycleTypeIcon(cycle?.cycle_type)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{cycle?.name || 'Cycle'}</h3>
            <p className="text-xs text-gray-500">{cycle?.location}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
          {booking.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div><span className="text-gray-400">Start:</span> {formatDate(booking.start_time)} {formatTime(booking.start_time)}</div>
        {booking.end_time && <div><span className="text-gray-400">End:</span> {formatDate(booking.end_time)} {formatTime(booking.end_time)}</div>}
        {booking.duration_hours && <div><span className="text-gray-400">Duration:</span> {formatDuration(booking.duration_hours)}</div>}
        {booking.total_cost && <div><span className="text-gray-400">Cost:</span> <span className="font-semibold text-blue-600">{formatCurrency(booking.total_cost)}</span></div>}
      </div>
      {(booking.status === 'active' || booking.status === 'booked') && (
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => onComplete(booking.id)}>Complete Ride</Button>
          <Button size="sm" variant="danger" onClick={() => onCancel(booking.id)}>Cancel</Button>
        </div>
      )}
    </div>
  );
};
export default RideCard;
