import { completeBooking, cancelBooking, getMyRides } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import RideCard from '../components/booking/RideCard';
import toast from 'react-hot-toast';

const MyRides = () => {
  const { data: bookings, loading, refetch } = useFetch(getMyRides);

  const handleComplete = async (id) => {
    try {
      await completeBooking(id);
      toast.success('Ride completed! 🎉');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Loader />;

  const active = bookings?.filter(b => ['active', 'booked'].includes(b.status)) || [];
  const past = bookings?.filter(b => !['active', 'booked'].includes(b.status)) || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Rides</h1>
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">🟢 Active Bookings</h2>
          <div className="space-y-3">
            {active.map(b => <RideCard key={b.id} booking={b} onComplete={handleComplete} onCancel={handleCancel} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Past Rides</h2>
          <div className="space-y-3">
            {past.map(b => <RideCard key={b.id} booking={b} onComplete={handleComplete} onCancel={handleCancel} />)}
          </div>
        </div>
      )}
      {!bookings?.length && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚲</div>
          <p className="text-gray-500">No rides yet. Start your first ride!</p>
        </div>
      )}
    </div>
  );
};
export default MyRides;
