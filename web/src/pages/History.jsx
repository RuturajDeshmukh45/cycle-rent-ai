import { getRideHistory } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { formatCurrency, formatDate, formatDuration } from '../utils/helpers';
import { Clock, TrendingUp, DollarSign, Bike } from 'lucide-react';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };

const History = () => {
  const { data: history, loading } = useFetch(getRideHistory);
  if (loading) return <Loader />;

  const totalSpent = history?.reduce((s, r) => s + parseFloat(r.total_cost || 0), 0) || 0;
  const totalRides = history?.length || 0;
  const avgDuration = totalRides ? (history.reduce((s, r) => s + parseFloat(r.duration_hours || 0), 0) / totalRides) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Ride History</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Rides', value: totalRides, icon: Bike, color: 'var(--accent)' },
          { label: 'Total Spent', value: `₹${totalSpent.toFixed(2)}`, icon: DollarSign, color: '#10b981' },
          { label: 'Avg Duration', value: `${avgDuration.toFixed(1)}h`, icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
            <Icon size={18} className="mb-2" style={{ color }} />
            <p className="text-xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {history?.length ? (
        <div className="space-y-3">
          {history.map((ride) => (
            <div key={ride.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-input)' }}>
                {typeEmoji[ride.cycle?.cycle_type] || '🚲'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{ride.cycle?.name || 'Cycle Ride'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(ride.createdAt)} · {formatDuration(ride.duration_hours)}</p>
                {ride.start_location && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{ride.start_location} → {ride.end_location || '—'}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{parseFloat(ride.total_cost).toFixed(2)}</p>
                {ride.rating && <p className="text-xs">{Array(ride.rating).fill('⭐').join('')}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-secondary)' }}>No ride history yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Complete a ride to see it here</p>
        </div>
      )}
    </div>
  );
};
export default History;
