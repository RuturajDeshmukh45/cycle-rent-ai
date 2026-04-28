import { MapPin, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, getCycleTypeIcon } from '../../utils/helpers';
import Button from '../comman/Button';

const CycleCard = ({ cycle }) => {
  const navigate = useNavigate();
  const isAvailable = cycle.status === 'available';
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-32 flex items-center justify-center text-5xl">
        {getCycleTypeIcon(cycle.cycle_type)}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">{cycle.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {cycle.status}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-xs mb-1">
          <MapPin size={12} className="mr-1" /> {cycle.location}
        </div>
        <div className="flex items-center text-gray-500 text-xs mb-3">
          <Clock size={12} className="mr-1" />
          <span className="font-semibold text-blue-600">{formatCurrency(cycle.price_per_hour)}/hr</span>
          {cycle.cycle_type === 'electric' && <span className="ml-2 flex items-center text-yellow-600"><Zap size={10} className="mr-0.5" />Electric</span>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/cycles/${cycle.id}`)}>Details</Button>
          {isAvailable && <Button size="sm" className="flex-1" onClick={() => navigate(`/booking/${cycle.id}`)}>Rent Now</Button>}
        </div>
      </div>
    </div>
  );
};
export default CycleCard;
