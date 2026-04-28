import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/booking.service';
import { getDynamicPricing } from '../../services/ai.service';
import { formatCurrency } from '../../utils/helpers';
import Input from '../comman/Input';
import Button from '../comman/Button';
import toast from 'react-hot-toast';

const BookingForm = ({ cycle }) => {
  const [form, setForm] = useState({ pickup_location: cycle?.location || '', drop_location: '' });
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPricing = async () => {
    try {
      const res = await getDynamicPricing({ base_price: cycle?.price_per_hour });
      setPricing(res.data?.data);
    } catch {}
  };

  useState(() => { if (cycle) fetchPricing(); }, [cycle]);

  const handleSubmit = async () => {
    if (!form.drop_location) { toast.error('Please enter drop location'); return; }
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
      {pricing && (
        <div className={`p-3 rounded-lg ${pricing.pricing?.isPeakHour ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-600">Current Rate (AI Pricing)</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(pricing.pricing?.finalPrice)}/hr</p>
              <p className="text-xs text-gray-500">{pricing.pricing?.pricingReason}</p>
            </div>
            {pricing.pricing?.isPeakHour && <span className="text-orange-500 text-2xl">🔥</span>}
          </div>
        </div>
      )}
      <Input label="Pickup Location" value={form.pickup_location} onChange={(e) => setForm(p => ({ ...p, pickup_location: e.target.value }))} placeholder="Enter pickup location" />
      <Input label="Drop Location *" value={form.drop_location} onChange={(e) => setForm(p => ({ ...p, drop_location: e.target.value }))} placeholder="Enter drop location" />
      <Button className="w-full" onClick={handleSubmit} loading={loading}>Confirm Booking 🚲</Button>
    </div>
  );
};
export default BookingForm;
