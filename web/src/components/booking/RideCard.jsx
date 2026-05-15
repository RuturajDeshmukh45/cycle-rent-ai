import { MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

const badgeClass = {
  booked: 'badge-booked', active: 'badge-active',
  completed: 'badge-completed', cancelled: 'badge-cancelled',
};
const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

// Fix 4: proper hours and minutes
const fmtDuration = (hours) => {
  if (!hours || isNaN(parseFloat(hours))) return null;
  const h = Math.floor(parseFloat(hours));
  const m = Math.round((parseFloat(hours) - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
};

const RideCard = ({ booking, onComplete, onCancel }) => {
  const cycle = booking.cycle;
  const isActive = ['active', 'booked'].includes(booking.status);
  const duration = fmtDuration(booking.duration_hours);

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${isActive ? 'glow-pulse' : ''}`}
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${isActive ? 'var(--border-strong)' : 'var(--border)'}`,
        boxShadow: 'var(--shadow-sm)',
      }}>
      {isActive && (
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,var(--accent),transparent)' }} />
      )}
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: 'var(--bg-input)', fontSize: '18px' }}>
              {typeEmoji[cycle?.cycle_type] || '🚲'}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                {cycle?.name || 'Cycle'}
              </h3>
              <div className="flex items-center gap-1 text-xs mt-0.5 min-w-0" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{cycle?.location}</span>
              </div>
            </div>
          </div>
          <span className={`badge shrink-0 ${badgeClass[booking.status] || 'badge-completed'}`}>
            {booking.status}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl p-2.5" style={{ background: 'var(--bg-input)' }}>
            <p className="text-xs mb-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Clock size={9} /> Started
            </p>
            <p className="text-xs font-semibold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              {fmtDate(booking.start_time)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{fmtTime(booking.start_time)}</p>
          </div>

          {booking.total_cost ? (
            <div className="rounded-xl p-2.5" style={{ background: 'var(--accent-light)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Total Cost</p>
              <p className="text-base font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                ₹{parseFloat(booking.total_cost).toFixed(2)}
              </p>
              {/* Fix 4: show proper duration */}
              {duration && (
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
                  ⏱ {duration}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-2.5" style={{ background: 'var(--bg-input)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Rate</p>
              <p className="text-base font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                ₹{cycle?.price_per_hour}/hr
              </p>
              {isActive && (
                <p className="text-xs" style={{ color: 'var(--success)' }}>Ride active</p>
              )}
            </div>
          )}
        </div>

        {/* Route */}
        {(booking.pickup_location || booking.drop_location) && (
          <div className="rounded-xl p-2.5 mb-3 space-y-1.5"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            {booking.pickup_location && (
              <div className="flex items-center gap-2 text-xs min-w-0" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="truncate">{booking.pickup_location}</span>
              </div>
            )}
            {booking.drop_location && (
              <div className="flex items-center gap-2 text-xs min-w-0" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400" />
                <span className="truncate">{booking.drop_location}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
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
