import { useEffect, useState } from 'react';
import { getAllCycles } from '../services/cycle.service';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/comman/Loader';
import { MapPin, Bike } from 'lucide-react';

const MapView = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCycles().then(r => { setCycles(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading stations..." />;

  const stations = {};
  cycles.forEach(c => { if (!stations[c.location]) stations[c.location] = []; stations[c.location].push(c); });

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Map View</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Browse all cycle stations</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(stations).map(([location, stCycles]) => {
          const available = stCycles.filter(c => c.status === 'available').length;
          const isSelected = selected === location;
          return (
            <div key={location}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{ background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, boxShadow: isSelected ? 'var(--shadow-accent)' : 'var(--shadow-sm)' }}
              onClick={() => setSelected(isSelected ? null : location)}
            >
              {isSelected && <div className="h-0.5" style={{ background: 'linear-gradient(90deg,var(--accent),transparent)' }} />}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center`}
                      style={{ background: available > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                      <MapPin size={15} style={{ color: available > 0 ? 'var(--success)' : 'var(--danger)' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{location}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stCycles.length} cycles total</p>
                    </div>
                  </div>
                  <span className={`badge ${available > 0 ? 'badge-available' : 'badge-cancelled'}`} style={{ fontFamily: 'Syne' }}>
                    {available} free
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    {stCycles.map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-xl p-2.5" style={{ background: 'var(--bg-input)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.cycle_type === 'electric' ? '⚡' : c.cycle_type === 'mountain' ? '🏔️' : '🚲'}</span>
                          <div>
                            <p className="text-xs font-semibold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{c.name}</p>
                            <p className="text-xs" style={{ color: 'var(--accent)' }}>₹{c.price_per_hour}/hr</p>
                          </div>
                        </div>
                        {c.status === 'available' ? (
                          <button className="btn-primary text-xs px-3 py-1.5" onClick={(e) => { e.stopPropagation(); navigate(`/booking/${c.id}`); }}>
                            Rent
                          </button>
                        ) : <span className="badge badge-booked text-xs">Booked</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MapView;
