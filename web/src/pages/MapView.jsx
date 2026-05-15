import { useEffect, useState } from 'react';
import { getAllCycles } from '../services/cycle.service';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/comman/Loader';
import LiveMap from '../components/map/LiveMap';
import { MapPin, Bike, RefreshCw } from 'lucide-react';

const MapView = () => {
  const [cycles, setCycles]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchCycles = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const r = await getAllCycles();
      setCycles(r.data?.data || []);
    } catch {
      setCycles([]);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => { fetchCycles(); }, []);

  useEffect(() => {
    const id = setInterval(() => fetchCycles(true), 30000);
    return () => clearInterval(id);
  }, []);

  const filtered    = filter === 'all' ? cycles : cycles.filter(c => c.status === filter);
  const availCount  = cycles.filter(c => c.status === 'available').length;

  if (loading) return <Loader text="Loading map..." />;

  return (
    <div className="p-6 max-w-6xl mx-auto page-enter">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold mb-1"
            style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Live Map
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Track cycles in real time · {availCount} available now
          </p>
        </div>
        <button
          onClick={() => fetchCycles(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'Space Grotesk',
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'spinner' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'available', 'booked', 'maintenance'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
            style={{
              fontFamily: 'Space Grotesk',
              background: filter === f ? 'var(--accent)' : 'var(--bg-input)',
              color:      filter === f ? '#fff' : 'var(--text-secondary)',
              border:     filter === f ? 'none' : '1px solid var(--border)',
            }}
          >
            {f === 'all'
              ? `All (${cycles.length})`
              : `${f} (${cycles.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* ── Live Map — NO BookingForm here, only cycle markers ── */}
      <LiveMap
        cycles={filtered}
        showDropMarker={false}
        onCycleSelect={(cycle) => {
          if (cycle.status === 'available') navigate(`/cycles/${cycle.id}`);
        }}
        height="500px"
      />

      {/* ── Legend ── */}
      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: '#22c55e', label: 'Available' },
          { color: '#ef4444', label: 'Booked / Unavailable' },
          { color: '#3b82f6', label: 'Your Location' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              {label}
            </span>
          </div>
        ))}
        <div className="ml-auto text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
          🔄 Auto-refreshes every 30s
        </div>
      </div>

      {/* ── All Stations ── */}
      <div className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>
          All Stations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(
            filtered.reduce((acc, c) => {
              (acc[c.location] = acc[c.location] || []).push(c);
              return acc;
            }, {})
          ).map(([location, stCycles]) => {
            const available = stCycles.filter(c => c.status === 'available').length;
            return (
              <div
                key={location}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: available > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    <MapPin
                      size={14}
                      style={{ color: available > 0 ? 'var(--success)' : 'var(--danger)' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm truncate"
                      style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}
                    >
                      {location}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {stCycles.length} cycles total
                    </p>
                  </div>
                  <span className={`badge ${available > 0 ? 'badge-available' : 'badge-booked'}`}>
                    {available} free
                  </span>
                </div>
                {available > 0 && (
                  <button
                    className="btn-primary w-full py-1.5 text-xs mt-1"
                    onClick={() => navigate(`/dashboard?location=${encodeURIComponent(location)}`)}
                  >
                    <Bike size={12} /> Rent from here
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapView;