import { useState } from 'react';
import { Star, X, Send, Bike, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitReview, updateReview } from '../../services/review.service';

const starLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent!'];

/**
 * Props:
 *   booking    – booking object (must have .id and .cycle.name)
 *   existing   – existing review object { id, rating, comment } when editing, else null/undefined
 *   onClose    – fn()
 *   onSubmitted – fn() called after successful submit/update
 */
const ReviewModal = ({ booking, existing, onClose, onSubmitted }) => {
  const isEdit = !!existing;
  const [rating,  setRating]  = useState(existing?.rating  || 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [loading, setLoading] = useState(false);

  const active = hovered || rating;

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a star rating');
    setLoading(true);
    try {
      if (isEdit) {
        await updateReview(existing.id, { rating, comment });
        toast.success('Review updated! ✏️');
      } else {
        await submitReview({ booking_id: booking.id, rating, comment });
        toast.success('Review submitted! 🌟 Thanks for your feedback');
      }
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl slide-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-light)' }}>
              {isEdit
                ? <Pencil size={16} style={{ color: 'var(--accent)' }} />
                : <Bike size={18} style={{ color: 'var(--accent)' }} />}
            </div>
            <div>
              <h2 className="text-base font-extrabold"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                {isEdit ? 'Edit Your Review' : 'Rate Your Ride'}
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {booking?.cycle?.name || 'Cycle'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
            <X size={15} />
          </button>
        </div>

        <div className="px-6 pb-8">
          {/* Stars */}
          <div className="flex justify-center gap-3 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-all duration-150 active:scale-90"
                style={{ transform: active >= star ? 'scale(1.15)' : 'scale(1)' }}
              >
                <Star
                  size={40}
                  fill={active >= star ? '#facc15' : 'none'}
                  strokeWidth={1.5}
                  style={{
                    color: active >= star ? '#facc15' : 'var(--border-strong)',
                    transition: 'all 0.15s',
                    filter: active >= star ? 'drop-shadow(0 0 6px rgba(250,204,21,0.5))' : 'none',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Label */}
          <p className="text-center text-sm font-bold mb-5 transition-all"
            style={{ fontFamily: 'Space Grotesk', color: active ? '#facc15' : 'var(--text-muted)', minHeight: '20px' }}>
            {active ? starLabels[active] : 'Tap to rate'}
          </p>

          {/* Comment box */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none border transition-all"
            style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            onFocus={(e)  => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e)   => (e.target.style.borderColor = 'var(--border)')}
            maxLength={300}
          />
          <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
            {comment.length}/300
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="w-full mt-4 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: rating ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'var(--bg-input)',
              color: rating ? '#fff' : 'var(--text-muted)',
              boxShadow: rating ? 'var(--shadow-accent)' : 'none',
              fontFamily: 'Space Grotesk',
            }}
          >
            {loading
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Send size={15} /> {isEdit ? 'Update Review' : 'Submit Review'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;