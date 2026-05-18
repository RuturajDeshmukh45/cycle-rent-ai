import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, Mountain, Bike, Battery } from 'lucide-react';

const typeConfig = {
  electric: { icon: Zap, label: 'Electric', color: '#22c55e', emoji: '⚡' },
  mountain: { icon: Mountain, label: 'Mountain', color: '#f59e0b', emoji: '🏔️' },
  standard: { icon: Bike, label: 'Standard', color: '#3b82f6', emoji: '🚲' },
};

const CycleCard = ({ cycle }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const isAvailable = cycle.status === 'available';
  const cfg = typeConfig[cycle.cycle_type] || typeConfig.standard;
  const TypeIcon = cfg.icon;

  // Fix 5: always show image if available (Cloudinary url), fallback to emoji
  const showImage = !!(cycle.image_url && !imgError);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        height: '100%',
      }}
      onClick={() => navigate(`/cycles/${cycle.id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image area — Fix 5 */}
      <div className="relative overflow-hidden shrink-0" style={{ height: '150px' }}>
        {showImage ? (
          <>
            <img
              src={cycle.image_url}
              alt={cycle.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 55%)' }} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--gradient-card)' }}>
            <div className="absolute inset-0"
              style={{ background: `radial-gradient(circle at 60% 40%,${cfg.color}22,transparent 65%)` }} />
            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'var(--bg-card)', boxShadow: `0 4px 16px ${cfg.color}22` }}>
              {cfg.emoji}
            </div>
          </div>
        )}

        {/* Top badges - no overlap */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-white shrink-0"
            style={{ background: `${cfg.color}cc`, backdropFilter: 'blur(4px)', maxWidth: '80px' }}>
            <TypeIcon size={10} />
            <span className="truncate">{cfg.label}</span>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm shrink-0 mt-0.5 ${isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>

        {/* Bottom price overlay when image shown */}
        {showImage && (
          <div className="absolute bottom-2 left-2">
            <span className="text-white font-extrabold text-base"
              style={{ fontFamily: 'Space Grotesk', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              ₹{cycle.price_per_hour}<span className="text-xs font-normal opacity-80">/hr</span>
            </span>
          </div>
        )}
      </div>

      {/* Content — Fix 2: no text overflow */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold leading-snug flex-1 min-w-0 truncate"
            style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            {cycle.name}
          </h3>
          <span className={`badge shrink-0 text-xs ${isAvailable ? 'badge-available' : cycle.status === 'maintenance' ? 'badge-maintenance' : 'badge-booked'}`}>
            {cycle.status}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2 min-w-0" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} className="shrink-0" />
          <span className="text-xs truncate">{cycle.location}</span>
        </div>

        {/* Price when no image shown */}
        {!showImage && (
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-lg font-extrabold"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                ₹{cycle.price_per_hour}
              </span>
              <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>/hr</span>
            </div>
            {cycle.cycle_type === 'electric' && (
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Battery size={10} /> EV
              </div>
            )}
          </div>
        )}

        {/* Rent button */}
        {isAvailable && (
          <button
            className="btn-primary w-full mt-auto py-2 text-xs"
            style={{ fontSize: '12px' }}
            onClick={e => { e.stopPropagation(); navigate(`/booking/${cycle.id}`); }}
          >
            Rent Now →
          </button>
        )}
      </div>
    </div>
  );
};

export default CycleCard;
