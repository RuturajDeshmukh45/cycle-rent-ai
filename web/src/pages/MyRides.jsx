import { completeBooking, cancelBooking, getMyRides } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import RideCard from '../components/booking/RideCard';
import toast from 'react-hot-toast';
import { Bike } from 'lucide-react';

const MyRides = () => {
  const { data: bookings, loading, refetch } = useFetch(getMyRides);

  const handleComplete = async (id) => {
    try { await completeBooking(id); toast.success('Ride completed! 🎉'); refetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await cancelBooking(id); toast.success('Booking cancelled'); refetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Loader />;

  const active = bookings?.filter(b => ['active', 'booked'].includes(b.status)) || [];
  const past = bookings?.filter(b => !['active', 'booked'].includes(b.status)) || [];

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>My Rides</h1>

      {active.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Syne', color: 'var(--success)' }}>Active</h2>
          </div>
          <div className="space-y-3">
            {active.map(b => <RideCard key={b.id} booking={b} onComplete={handleComplete} onCancel={handleCancel} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ fontFamily: 'Syne', color: 'var(--text-muted)' }}>Past Rides</h2>
          <div className="space-y-3">
            {past.map(b => <RideCard key={b.id} booking={b} onComplete={handleComplete} onCancel={handleCancel} />)}
          </div>
        </div>
      )}

      {!bookings?.length && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>🚲</div>
          <p className="font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-secondary)' }}>No rides yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Go to Dashboard to start your first ride</p>
        </div>
      )}
    </div>
  );
};
export default MyRides;
