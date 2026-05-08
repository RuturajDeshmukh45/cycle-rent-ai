import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, Mountain, Bike } from 'lucide-react';

const typeConfig = {
  electric: { icon: Zap, label: 'Electric', color: '#f59e0b' },
  mountain: { icon: Mountain, label: 'Mountain', color: '#10b981' },
  standard: { icon: Bike, label: 'Standard', color: '#38bdf8' },
};

const CycleCard = ({ cycle }) => {
  const navigate = useNavigate();
  const isAvailable = cycle.status === 'available';
  const cfg = typeConfig[cycle.cycle_type] || typeConfig.standard;
  const TypeIcon = cfg.icon;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      onClick={() => navigate(`/cycles/${cycle.id}`)}
    >
      {/* Image / Icon area */}
      <div className="h-28 flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 70% 30%, ${cfg.color}40, transparent 60%)` }} />
        <div className="relative flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md" style={{ background: 'var(--bg-card)', boxShadow: `0 4px 16px ${cfg.color}30` }}>
            {cycle.cycle_type === 'electric' ? '⚡' : cycle.cycle_type === 'mountain' ? '🏔️' : '🚲'}
          </div>
        </div>
        {/* Status dot */}
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{cycle.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isAvailable ? 'badge-available' : 'badge-booked'}`} style={{ fontFamily: 'Syne' }}>
            {cycle.status}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} />
          <span className="text-xs truncate">{cycle.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{cycle.price_per_hour}</span>
            <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>/hr</span>
          </div>
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <TypeIcon size={10} style={{ color: cfg.color }} />
            {cfg.label}
          </div>
        </div>

        {isAvailable && (
          <button
            className="btn-primary w-full mt-3 py-2 text-xs"
            onClick={(e) => { e.stopPropagation(); navigate(`/booking/${cycle.id}`); }}
          >
            Rent Now
          </button>
        )}
      </div>
    </div>
  );
};
export default CycleCard;
