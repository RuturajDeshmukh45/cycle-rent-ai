import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import BookingForm from '../components/booking/BookingForm';
import { ChevronLeft, MapPin, Shield } from 'lucide-react';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };
const typeColor = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };

const Booking = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { data: cycle, loading } = useFetch(() => getCycleById(cycleId), [cycleId]);
  const [imgError, setImgError] = useState(false);

  if (loading) return <Loader />;
  if (!cycle) return <div className="p-6 text-center py-20" style={{ color: 'var(--text-secondary)' }}>Cycle not found</div>;
  if (cycle.status !== 'available') return (
    <div className="p-6 text-center py-20">
      <div className="text-4xl mb-3">😕</div>
      <p className="font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>Cycle not available</p>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-sm font-semibold" style={{ color: 'var(--accent)' }}>← Back to Dashboard</button>
    </div>
  );

  const emoji = typeEmoji[cycle.cycle_type] || '🚲';
  const color = typeColor[cycle.cycle_type] || '#3b82f6';
  const showImage = !!(cycle.image_url && !imgError);

  return (
    <div className="p-6 max-w-lg mx-auto page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-5 transition-colors" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="text-xl font-extrabold mb-5" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Book Your Ride</h1>

      {/* Cycle summary card with real image */}
      <div className="rounded-2xl mb-5 overflow-hidden flex items-stretch gap-0"
        style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Left: image thumbnail */}
        <div className="relative shrink-0 overflow-hidden" style={{ width: '90px' }}>
          {showImage ? (
            <>
              <img
                src={cycle.image_url}
                alt={cycle.name}
                className="w-full h-full object-cover"
                style={{ minHeight: '80px' }}
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, var(--gradient-card))' }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)`, minHeight: '80px' }}>
              <span style={{ fontSize: '28px' }}>{emoji}</span>
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="flex-1 p-4 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{cycle.name}</h2>
            <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={11} /> <span className="truncate">{cycle.location}</span>
            </div>
            <div className="text-base font-extrabold mt-0.5" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
              ₹{cycle.price_per_hour}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/hr</span>
            </div>
          </div>
          <div className="badge badge-available shrink-0">Available</div>
        </div>
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'visible',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <BookingForm cycle={cycle} />
      </div>

      {/* Coverage note */}
      <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
        <Shield size={14} style={{ color: 'var(--accent)', shrink: 0 }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Full ride coverage included with every booking</p>
      </div>
    </div>
  );
};

export default Booking;