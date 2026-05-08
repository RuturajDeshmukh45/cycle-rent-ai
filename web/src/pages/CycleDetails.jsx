import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { MapPin, Zap, Mountain, Bike, ChevronLeft, Star } from 'lucide-react';

const CycleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cycle, loading } = useFetch(() => getCycleById(id), [id]);

  if (loading) return <Loader />;
  if (!cycle) return (
    <div className="p-6 text-center py-20">
      <p style={{ color: 'var(--text-secondary)' }}>Cycle not found</p>
    </div>
  );

  const isAvailable = cycle.status === 'available';
  const typeColors = { electric: '#f59e0b', mountain: '#10b981', standard: '#38bdf8' };
  const typeColor = typeColors[cycle.cycle_type] || '#38bdf8';
  const typeEmoji = cycle.cycle_type === 'electric' ? '⚡' : cycle.cycle_type === 'mountain' ? '🏔️' : '🚲';

  const specs = [
    { label: 'Type', value: cycle.cycle_type?.charAt(0).toUpperCase() + cycle.cycle_type?.slice(1) },
    { label: 'Status', value: cycle.status },
    { label: 'Location', value: cycle.location },
    { label: 'Price/hr', value: `₹${cycle.price_per_hour}` },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-secondary)', fontFamily: 'Syne' }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Hero */}
        <div className="h-48 flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${typeColor}20, transparent 70%)` }} />
          <div className="relative text-center">
            <div className="text-7xl mb-2">{typeEmoji}</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isAvailable ? 'badge-available' : 'badge-booked'}`} style={{ fontFamily: 'Syne' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {isAvailable ? 'Available Now' : 'Not Available'}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Name & price */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{cycle.name}</h1>
              <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={13} /> <span className="text-sm">{cycle.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{cycle.price_per_hour}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per hour</div>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {specs.map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>{label}</p>
                <p className="text-sm font-bold capitalize" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>{value}</p>
              </div>
            ))}
          </div>

          {cycle.description && (
            <div className="mb-5 rounded-xl p-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>About this ride</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cycle.description}</p>
            </div>
          )}

          {isAvailable ? (
            <button className="btn-primary w-full py-3 text-sm" onClick={() => navigate(`/booking/${cycle.id}`)}>
              🚲 Rent This Cycle
            </button>
          ) : (
            <button className="btn-secondary w-full py-3 text-sm cursor-not-allowed" disabled>Currently Unavailable</button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CycleDetails;
