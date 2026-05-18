import { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/booking.service';
import { getDynamicPricing } from '../../services/ai.service';
import toast from 'react-hot-toast';
import { MapPin, Navigation, ArrowRight, Map } from 'lucide-react';
import LiveMap from '../map/LiveMap';
import Popup from '../comman/Popup';

// ── Error Boundary ────────────────────────────────────────────────────────────
class MapErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{
        height: '280px', borderRadius: '16px', border: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '8px', background: 'var(--bg-card)',
      }}>
        <span style={{ fontSize: '2rem' }}>🗺️</span>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'Space Grotesk' }}>
          Map failed to load
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Please type your drop location manually
        </p>
      </div>
    );
    return this.props.children;
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.pickup_location.trim()) errs.pickup_location = 'Pickup location is required';
  if (!form.drop_location.trim()) errs.drop_location = 'Drop location is required';
  else if (form.drop_location.trim() === form.pickup_location.trim())
    errs.drop_location = 'Drop must differ from pickup';
  return errs;
};

// ── Shared input wrapper style ────────────────────────────────────────────────
// Renders a left icon + input with guaranteed non-overlapping padding
const LocationInput = ({ icon: Icon, iconColor, name, value, onChange, placeholder, hasError }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    {/* Icon pinned to left, vertically centered, pointer-events off so it doesn't interfere */}
    <span style={{
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      <Icon size={14} color={iconColor} />
    </span>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      style={{
        /* Enough left padding so text never touches the icon */
        paddingLeft: '36px',
        paddingRight: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: '10px',
        border: `1.5px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
        background: 'var(--bg-input)',
        color: 'var(--text-primary)',
        fontSize: '14px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
      onBlur={e => { e.target.style.borderColor = hasError ? 'var(--danger)' : 'var(--border)'; }}
    />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const BookingForm = ({ cycle }) => {
  const [form, setForm]               = useState({ pickup_location: cycle?.location || '', drop_location: '' });
  const [errors, setErrors]           = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pricing, setPricing]         = useState(null);
  const [loading, setLoading]         = useState(false);
  const [showMap, setShowMap]         = useState(false);
  const [dropLatLng, setDropLatLng]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cycle) return;
    getDynamicPricing({ base_price: cycle.price_per_hour })
      .then(r => setPricing(r.data?.data))
      .catch(() => {});
  }, [cycle]);

  // Trigger Leaflet invalidateSize when map becomes visible
  useEffect(() => {
    if (!showMap) return;
    const t1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    const t2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    const t3 = setTimeout(() => window.dispatchEvent(new Event('resize')), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [showMap]);

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleDropLocationChange = (latlng) => {
    if (!latlng || latlng.lat == null || latlng.lng == null) return;
    setDropLatLng(latlng);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(r => r.json())
      .then(data => {
        const addr = data.display_name?.split(',').slice(0, 3).join(', ')
          || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        setForm(p => ({ ...p, drop_location: addr }));
        if (errors.drop_location) setErrors(p => ({ ...p, drop_location: '' }));
      })
      .catch(() => {
        setForm(p => ({ ...p, drop_location: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}` }));
      });
  };

  const handleSubmit = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setConfirmOpen(true);
  };

  const doBooking = async () => {
    setLoading(true);
    setConfirmOpen(false);
    try {
      await createBooking({
        cycle_id: cycle.id, ...form,
        drop_lat: dropLatLng?.lat, drop_lng: dropLatLng?.lng,
      });
      try {
        const existing = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        existing.unshift({
          title:   `New Booking: ${cycle?.name}`,
          message: `Pickup: ${form.pickup_location} → Drop: ${form.drop_location}`,
          time:    new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        });
        localStorage.setItem('admin_notifications', JSON.stringify(existing.slice(0, 20)));
        window.dispatchEvent(new Event('storage'));
      } catch { /* silent */ }
      toast.success('Booking confirmed! Ride started 🚲');
      navigate('/my-rides');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── AI Dynamic Price ── */}
      {pricing?.pricing && (
        <div style={{
          borderRadius: '12px', padding: '16px',
          background: pricing.pricing.isPeakHour ? 'rgba(245,158,11,0.07)' : 'rgba(34,197,94,0.07)',
          border: `1px solid ${pricing.pricing.isPeakHour ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.2)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', marginBottom: '2px',
                color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                AI Dynamic Price
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800,
                  fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                  ₹{pricing.pricing.finalPrice}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/hr</span>
              </div>
              <p style={{ fontSize: '12px', marginTop: '2px', color: 'var(--text-secondary)' }}>
                {pricing.pricing.pricingReason}
              </p>
            </div>
            <div style={{ fontSize: '30px' }}>{pricing.pricing.isPeakHour ? '🔥' : '✅'}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[
              { label: 'Base',     val: `₹${pricing.pricing.basePrice}` },
              { label: 'Time ×',   val: pricing.pricing.timeMultiplier },
              { label: 'Demand ×', val: pricing.pricing.demandMultiplier },
            ].map(({ label, val }) => (
              <div key={label} style={{
                flex: 1, borderRadius: '8px', padding: '8px', textAlign: 'center',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '11px', fontWeight: 700, margin: 0,
                  color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pickup Location ── */}
      <div>
        <label style={{
          display: 'block', fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '6px', color: 'var(--text-muted)', fontFamily: 'Space Grotesk',
        }}>
          Pickup Location
        </label>
        <LocationInput
          icon={MapPin}
          iconColor="var(--accent)"
          name="pickup_location"
          value={form.pickup_location}
          onChange={onChange}
          placeholder="Enter pickup location"
          hasError={!!errors.pickup_location}
        />
        {errors.pickup_location && (
          <p style={{ marginTop: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--danger)' }}>
            ⚠ {errors.pickup_location}
          </p>
        )}
      </div>

      {/* ── Drop Location ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Space Grotesk',
          }}>
            Drop Location
          </label>
          <button
            type="button"
            onClick={() => setShowMap(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', fontWeight: 600, padding: '4px 10px',
              borderRadius: '8px', cursor: 'pointer', fontFamily: 'Space Grotesk',
              background: showMap ? 'var(--accent)' : 'var(--bg-input)',
              color:      showMap ? '#fff' : 'var(--accent)',
              border:     `1px solid ${showMap ? 'transparent' : 'var(--border-strong)'}`,
              transition: 'all 0.2s',
            }}
          >
            <Map size={11} /> {showMap ? 'Hide map' : 'Pick on map'}
          </button>
        </div>
        <LocationInput
          icon={Navigation}
          iconColor="var(--text-muted)"
          name="drop_location"
          value={form.drop_location}
          onChange={onChange}
          placeholder={showMap ? 'Drag the 🟡 pin on map…' : 'Enter drop location'}
          hasError={!!errors.drop_location}
        />
        {errors.drop_location && (
          <p style={{ marginTop: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--danger)' }}>
            ⚠ {errors.drop_location}
          </p>
        )}
      </div>

      {/* ── Map ── */}
      {showMap && (
        <div>
          <MapErrorBoundary>
            <div style={{
              height: '280px', borderRadius: '16px',
              overflow: 'hidden', border: '1.5px solid var(--border)',
            }}>
              <LiveMap
                cycles={[]}
                showDropMarker={true}
                dropLatLng={dropLatLng}
                onDropLocationChange={handleDropLocationChange}
                height="280px"
              />
            </div>
          </MapErrorBoundary>
          <p style={{ fontSize: '12px', marginTop: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
            🟡 Drag the yellow pin to set your drop location
          </p>
        </div>
      )}

      {/* ── Confirm Button ── */}
      <button
        className="btn-primary w-full py-3 text-sm"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <><span className="spinner inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Confirming...</>
        ) : (
          <><ArrowRight size={15} /> Confirm Booking</>
        )}
      </button>

      <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
        ⚡ AI pricing applies · Ride starts immediately
      </p>

      <Popup
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doBooking}
        title="Confirm Booking"
        message={`Book "${cycle?.name}" from ${form.pickup_location} to ${form.drop_location}? Your ride will start immediately after confirmation.`}
        confirmText="Yes, Start Ride 🚲"
        cancelText="Go Back"
        variant="confirm"
        loading={loading}
      />
    </div>
  );
};

export default BookingForm;