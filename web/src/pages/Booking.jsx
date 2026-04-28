import { useParams, useNavigate } from 'react-router-dom';
import { getCycleById } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import BookingForm from '../components/booking/BookingForm';
import { formatCurrency, getCycleTypeIcon } from '../utils/helpers';
import { MapPin } from 'lucide-react';

const Booking = () => {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { data: cycle, loading } = useFetch(() => getCycleById(cycleId), [cycleId]);

  if (loading) return <Loader />;
  if (!cycle) return <div className="p-6 text-center">Cycle not found</div>;
  if (cycle.status !== 'available') return (
    <div className="p-6 text-center">
      <div className="text-4xl mb-3">😕</div>
      <p className="text-gray-600">This cycle is not available for booking.</p>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-4 hover:underline">← Back</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Ride</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-4xl">{getCycleTypeIcon(cycle.cycle_type)}</span>
          <div>
            <h2 className="font-semibold text-gray-900">{cycle.name}</h2>
            <div className="flex items-center text-gray-500 text-xs"><MapPin size={12} className="mr-1" />{cycle.location}</div>
            <p className="text-blue-600 font-bold text-sm">{formatCurrency(cycle.price_per_hour)}/hr</p>
          </div>
        </div>
        <BookingForm cycle={cycle} />
      </div>
      <p className="text-xs text-gray-400 text-center">⚡ AI-powered dynamic pricing applies. Ride starts immediately on booking.</p>
    </div>
  );
};
export default Booking;
