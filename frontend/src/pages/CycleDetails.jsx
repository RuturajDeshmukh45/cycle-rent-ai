import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { MapPin, ChevronLeft, Zap, Mountain, Bike, Battery, Share2 } from 'lucide-react';

const CycleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const { data: cycle, loading } = useFetch(() => getCycleById(id), [id]);

  if (loading) return <Loader />;
  if (!cycle) return (
    <div className="p-6 text-center py-20">
      <p style={{ color: 'var(--text-secondary)' }}>Cycle not found</p>
    </div>
  );

  const isAvailable = cycle.status === 'available';
  const typeColors = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };
  const typeColor = typeColors[cycle.cycle_type] || '#3b82f6';
  const typeEmoji = cycle.cycle_type === 'electric' ? '⚡' : cycle.cycle_type === 'mountain' ? '🏔️' : '🚲';

  const specs = [
    { label: 'Type', value: cycle.cycle_type?.charAt(0).toUpperCase() + cycle.cycle_type?.slice(1) },
    { label: 'Status', value: cycle.status },
    { label: 'Location', value: cycle.location },
    { label: 'Price/hr', value: `₹${cycle.price_per_hour}` },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto page-enter">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold transition-colors"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          onClick={() => navigator.share?.({ title: cycle.name, url: window.location.href })}
        >
          <Share2 size={14} />
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        {/* Hero image area */}
        <div className="relative overflow-hidden" style={{ height: '260px' }}>
          {cycle.image_url && !imgError ? (
            <>
              <img
                src={cycle.image_url}
                alt={cycle.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gradient-card)' }}>
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${typeColor}20, transparent 70%)` }} />
              <div className="relative text-center">
                <div className="text-8xl mb-3">{typeEmoji}</div>
              </div>
            </div>
          )}

          {/* Overlaid status badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`badge ${isAvailable ? 'badge-available' : 'badge-booked'}`}
              style={{ backdropFilter: 'blur(8px)', background: isAvailable ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.8)', color: '#fff', border: 'none' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-white'}`} />
              {isAvailable ? 'Available Now' : 'Not Available'}
            </span>
          </div>

          {/* Overlaid price */}
          {cycle.image_url && !imgError && (
            <div className="absolute bottom-4 left-4">
              <span className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Space Grotesk', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                ₹{cycle.price_per_hour}<span className="text-base font-normal opacity-80">/hr</span>
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Name & price */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                {cycle.name}
              </h1>
              <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={13} />
                <span className="text-sm">{cycle.location}</span>
              </div>
            </div>
            {!(cycle.image_url && !imgError) && (
              <div className="text-right">
                <div className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                  ₹{cycle.price_per_hour}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per hour</div>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {specs.map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-0.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>{label}</p>
                <p className="text-sm font-bold capitalize"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* EV badge */}
          {cycle.cycle_type === 'electric' && (
            <div className="rounded-xl p-3 mb-5 flex items-center gap-2"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Battery size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                  Electric Cycle — Zero Emissions
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Powered by lithium-ion battery</p>
              </div>
            </div>
          )}

          {cycle.description && (
            <div className="mb-5 rounded-xl p-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>About this ride</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cycle.description}</p>
            </div>
          )}

          {isAvailable ? (
            <button className="btn-primary w-full py-3 text-sm" onClick={() => navigate(`/booking/${cycle.id}`)}>
              🚲 Rent This Cycle
            </button>
          ) : (
            <button className="btn-secondary w-full py-3 text-sm cursor-not-allowed opacity-60" disabled>
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CycleDetails;
