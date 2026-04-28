import { useEffect, useState } from 'react';
import { getAllCycles } from '../services/cycle.service';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/comman/Loader';
import { formatCurrency } from '../utils/helpers';
import { MapPin } from 'lucide-react';

const MapView = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCycles().then(res => { setCycles(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading map..." />;

  // Group by location
  const stations = {};
  cycles.forEach(c => {
    if (!stations[c.location]) stations[c.location] = [];
    stations[c.location].push(c);
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Cycle Map</h1>
      <p className="text-gray-500 text-sm mb-6">All cycle stations near you</p>
      
      {/* Station grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stations).map(([location, locationCycles]) => {
          const available = locationCycles.filter(c => c.status === 'available').length;
          return (
            <div
              key={location}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${selected === location ? 'border-blue-500 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
              onClick={() => setSelected(selected === location ? null : location)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${available > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <MapPin size={20} className={available > 0 ? 'text-green-600' : 'text-red-500'} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{location}</h3>
                    <p className="text-xs text-gray-500">{locationCycles.length} cycles total</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {available} available
                </span>
              </div>
              {selected === location && (
                <div className="mt-3 space-y-2">
                  {locationCycles.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <span className="text-sm text-gray-700">{c.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-600 font-medium">{formatCurrency(c.price_per_hour)}/hr</span>
                        {c.status === 'available' && (
                          <button onClick={() => navigate(`/booking/${c.id}`)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700">Rent</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MapView;
