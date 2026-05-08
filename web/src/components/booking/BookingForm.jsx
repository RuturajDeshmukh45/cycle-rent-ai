import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/booking.service';
import { getDynamicPricing } from '../../services/ai.service';
import toast from 'react-hot-toast';
import { MapPin, Navigation, ArrowRight, Zap } from 'lucide-react';

const validate = (form) => {
  const errs = {};
  if (!form.pickup_location.trim()) errs.pickup_location = 'Pickup location is required';
  if (!form.drop_location.trim()) errs.drop_location = 'Drop location is required';
  else if (form.drop_location.trim() === form.pickup_location.trim()) errs.drop_location = 'Drop location must differ from pickup';
  return errs;
};

const BookingForm = ({ cycle }) => {
  const [form, setForm] = useState({ pickup_location: cycle?.location || '', drop_location: '' });
  const [errors, setErrors] = useState({});
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cycle) return;
    getDynamicPricing({ base_price: cycle.price_per_hour }).then(r => setPricing(r.data?.data)).catch(() => {});
  }, [cycle]);

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createBooking({ cycle_id: cycle.id, ...form });
      toast.success('Booking confirmed! Ride started 🚲');
      navigate('/my-rides');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Dynamic pricing display */}
      {pricing && (
        <div className={`rounded-xl p-4 ${pricing.pricing?.isPeakHour ? 'border-amber-500/20' : 'border-emerald-500/20'}`}
          style={{ background: pricing.pricing?.isPeakHour ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.07)', border: `1px solid ${pricing.pricing?.isPeakHour ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>AI Dynamic Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>₹{pricing.pricing?.finalPrice}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/hr</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{pricing.pricing?.pricingReason}</p>
            </div>
            <div className="text-3xl">{pricing.pricing?.isPeakHour ? '🔥' : '✅'}</div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Base</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>₹{pricing.pricing?.basePrice}</p>
            </div>
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Time ×</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>{pricing.pricing?.timeMultiplier}</p>
            </div>
            <div className="flex-1 rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Demand ×</p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>{pricing.pricing?.demandMultiplier}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pickup */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Pickup Location</label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
          <input name="pickup_location" value={form.pickup_location} onChange={onChange} placeholder="Enter pickup location"
            className={`input-field pl-9 ${errors.pickup_location ? 'error' : ''}`} />
        </div>
        {errors.pickup_location && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.pickup_location}</p>}
      </div>

      {/* Drop */}
      <div>
        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Drop Location</label>
        <div className="relative">
          <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input name="drop_location" value={form.drop_location} onChange={onChange} placeholder="Enter drop location"
            className={`input-field pl-9 ${errors.drop_location ? 'error' : ''}`} />
        </div>
        {errors.drop_location && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.drop_location}</p>}
      </div>

      <button className="btn-primary w-full py-3 text-sm" onClick={handleSubmit} disabled={loading}>
        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />Confirming...</> : <><ArrowRight size={15} />Confirm Booking</>}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        ⚡ AI pricing applies · Ride starts immediately
      </p>
    </div>
  );
};
export default BookingForm;
