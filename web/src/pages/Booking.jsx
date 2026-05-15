import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import BookingForm from '../components/booking/BookingForm';
import { ChevronLeft, MapPin, Shield } from 'lucide-react';

const Booking = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { data: cycle, loading } = useFetch(() => getCycleById(cycleId), [cycleId]);

  if (loading) return <Loader />;
  if (!cycle) return <div className="p-6 text-center py-20" style={{ color: 'var(--text-secondary)' }}>Cycle not found</div>;
  if (cycle.status !== 'available') return (
    <div className="p-6 text-center py-20">
      <div className="text-4xl mb-3">😕</div>
      <p className="font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>Cycle not available</p>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-sm font-semibold" style={{ color: 'var(--accent)' }}>← Back to Dashboard</button>
    </div>
  );

  const typeEmoji = cycle.cycle_type === 'electric' ? '⚡' : cycle.cycle_type === 'mountain' ? '🏔️' : '🚲';

  return (
    <div className="p-6 max-w-lg mx-auto page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-5 transition-colors" style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk' }}>
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="text-xl font-extrabold mb-5" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Book Your Ride</h1>

      {/* Cycle summary */}
      <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          {typeEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{cycle.name}</h2>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={11} /> {cycle.location}
          </div>
          <div className="text-base font-extrabold mt-0.5" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
            ₹{cycle.price_per_hour}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/hr</span>
          </div>
        </div>
        <div className="badge badge-available shrink-0">Available</div>
      </div>

      {/* Form card — overflow must be visible so dropdowns/autocomplete can escape the card */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'visible',
          position: 'relative',   /* establishes stacking context */
          zIndex: 0,              /* keeps card below its own dropdowns */
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