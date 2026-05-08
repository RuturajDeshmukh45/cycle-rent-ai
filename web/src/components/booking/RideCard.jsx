import { formatCurrency, formatDate, formatTime, formatDuration } from '../../utils/helpers';
import { MapPin, Clock, Navigation, CheckCircle, XCircle } from 'lucide-react';

const badgeClass = { booked: 'badge-booked', active: 'badge-active', completed: 'badge-completed', cancelled: 'badge-cancelled' };
const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };

const RideCard = ({ booking, onComplete, onCancel }) => {
  const cycle = booking.cycle;
  const isActive = ['active', 'booked'].includes(booking.status);

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${isActive ? 'glow-pulse' : ''}`}
      style={{ background: 'var(--bg-card)', border: `1px solid ${isActive ? 'var(--border-strong)' : 'var(--border)'}`, boxShadow: 'var(--shadow-sm)' }}>
      {isActive && <div className="h-0.5" style={{ background: 'linear-gradient(90deg,var(--accent),transparent)' }} />}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-input)' }}>
              {typeEmoji[cycle?.cycle_type] || '🚲'}
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{cycle?.name || 'Cycle'}</h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={10} />{cycle?.location}
              </div>
            </div>
          </div>
          <span className={`badge ${badgeClass[booking.status] || 'badge-completed'}`} style={{ fontFamily: 'Syne' }}>{booking.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-input)' }}>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Started</p>
            <p className="text-xs font-semibold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{formatDate(booking.start_time)}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatTime(booking.start_time)}</p>
          </div>
          {booking.total_cost ? (
            <div className="rounded-lg p-2.5" style={{ background: 'var(--accent-light)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Total Cost</p>
              <p className="text-base font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{parseFloat(booking.total_cost).toFixed(2)}</p>
              {booking.duration_hours && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDuration(booking.duration_hours)}</p>}
            </div>
          ) : (
            <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-input)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Rate</p>
              <p className="text-base font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{cycle?.price_per_hour}/hr</p>
            </div>
          )}
        </div>

        {isActive && (
          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2 text-xs" onClick={() => onComplete(booking.id)}>
              <CheckCircle size={13} /> Complete Ride
            </button>
            <button className="btn-danger flex-1 py-2 text-xs" onClick={() => onCancel(booking.id)}>
              <XCircle size={13} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default RideCard;
