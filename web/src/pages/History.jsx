import { getRideHistory } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { formatCurrency, formatDate, formatDuration, getCycleTypeIcon } from '../utils/helpers';
import { Star } from 'lucide-react';

const History = () => {
  const { data: history, loading } = useFetch(getRideHistory);

  if (loading) return <Loader />;

  const totalSpent = history?.reduce((s, r) => s + parseFloat(r.total_cost || 0), 0) || 0;
  const totalRides = history?.length || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ride History</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-gray-500">Total Rides</p><p className="text-2xl font-bold text-blue-600">{totalRides}</p></div>
        <div className="bg-green-50 rounded-xl p-4"><p className="text-xs text-gray-500">Total Spent</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalSpent)}</p></div>
      </div>
      {history?.length ? (
        <div className="space-y-3">
          {history.map((ride) => (
            <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCycleTypeIcon(ride.cycle?.cycle_type)}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.cycle?.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(ride.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatCurrency(ride.total_cost)}</p>
                  <p className="text-xs text-gray-500">{formatDuration(ride.duration_hours)}</p>
                </div>
              </div>
              {ride.rating && (
                <div className="mt-2 flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={12} className={i < ride.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><div className="text-5xl mb-4">📋</div><p className="text-gray-500">No ride history yet.</p></div>
      )}
    </div>
  );
};
export default History;
