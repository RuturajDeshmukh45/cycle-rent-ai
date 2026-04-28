import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import Button from '../components/comman/Button';
import { formatCurrency, getCycleTypeIcon } from '../utils/helpers';
import { MapPin, Clock, Star, Zap } from 'lucide-react';

const CycleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: cycle, loading } = useFetch(() => getCycleById(id), [id]);

  if (loading) return <Loader />;
  if (!cycle) return <div className="p-6 text-center text-gray-500">Cycle not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-4 hover:underline">← Back</button>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-48 flex items-center justify-center text-8xl">
          {getCycleTypeIcon(cycle.cycle_type)}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cycle.name}</h1>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin size={14} className="mr-1" /> {cycle.location}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${cycle.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {cycle.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Price per hour</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(cycle.price_per_hour)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Cycle Type</p>
              <p className="text-sm font-semibold capitalize">{cycle.cycle_type}</p>
            </div>
          </div>
          {cycle.description && <p className="text-gray-600 text-sm mb-6">{cycle.description}</p>}
          {cycle.status === 'available' ? (
            <Button className="w-full" size="lg" onClick={() => navigate(`/booking/${cycle.id}`)}>
              Rent This Cycle 🚲
            </Button>
          ) : (
            <Button className="w-full" size="lg" disabled>Currently Unavailable</Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CycleDetails;
