import { useState, useMemo, useEffect, useCallback } from 'react';
import { completeBooking, cancelBooking, getMyRides } from '../services/booking.service';
import { getBookingReview } from '../services/review.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import RideCard from '../components/booking/RideCard';
import ReviewModal from '../components/booking/ReviewModal';
import Popup from '../components/comman/Popup';
import toast from 'react-hot-toast';
import { List, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Star, Pencil } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };
const typeColor  = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };

const CycleThumbnail = ({ cycle }) => {
  const [imgError, setImgError] = useState(false);
  const color     = typeColor[cycle?.cycle_type] || '#3b82f6';
  const emoji     = typeEmoji[cycle?.cycle_type] || '🚲';
  const showImage = !!(cycle?.image_url && !imgError);
  return (
    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
      style={{ background: showImage ? 'transparent' : `radial-gradient(circle, ${color}22, var(--bg-input) 70%)`, border: '1px solid var(--border)' }}>
      {showImage
        ? <img src={cycle.image_url} alt={cycle?.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        : <div className="w-full h-full flex items-center justify-center text-xl">{emoji}</div>}
    </div>
  );
};

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={11} fill={s <= rating ? '#facc15' : 'none'}
        style={{ color: s <= rating ? '#facc15' : 'var(--border-strong)' }} />
    ))}
  </div>
);

const MyRides = () => {
  const { data: bookings, loading, refetch } = useFetch(getMyRides);
  const [popup,         setPopup]         = useState({ open: false, type: '', id: null });
  const [actionLoading, setActionLoading] = useState(false);
  // reviewModal: { booking, existing } — existing is null for new, object for edit
  const [reviewModal, setReviewModal] = useState(null);
  // reviewMap: bookingId → review object | null (null = completed but no review yet)
  const [reviewMap, setReviewMap] = useState({});

  const [viewMode,      setViewMode]      = useState('list');
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear,  setSelectedYear]  = useState(currentYear.toString());
  const [currentPage,   setCurrentPage]   = useState(1);
  const pageSize = 5;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years  = ['2024','2025','2026'];

  // Load review status for every completed booking
  const loadReviews = useCallback(async (bList) => {
    if (!bList) return;
    const completed = bList.filter(b => b.status === 'completed');
    const results   = await Promise.allSettled(
      completed.map(b => getBookingReview(b.id).then(res => ({ id: b.id, review: res?.data })))
    );
    const map = {};
    results.forEach(r => {
      if (r.status === 'fulfilled') map[r.value.id] = r.value.review || null;
    });
    setReviewMap(map);
  }, []);

  useEffect(() => { if (bookings) loadReviews(bookings); }, [bookings, loadReviews]);

  const confirmComplete = (id) => setPopup({ open: true, type: 'complete', id });
  const confirmCancel   = (id) => setPopup({ open: true, type: 'cancel',   id });

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (popup.type === 'complete') {
        await completeBooking(popup.id);
        toast.success('Ride completed! 🎉');
        // Auto-open review modal for new review
        const booking = (Array.isArray(bookings) ? bookings : []).find(b => b.id === popup.id);
        if (booking) setTimeout(() => setReviewModal({ booking, existing: null }), 600);
      } else {
        await cancelBooking(popup.id);
        toast.success('Booking cancelled');
      }
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(false);
      setPopup({ open: false, type: '', id: null });
    }
  };

  const openNewReview  = (booking)          => setReviewModal({ booking, existing: null });
  const openEditReview = (booking, existing) => setReviewModal({ booking, existing });

  const handleReviewSubmitted = (bookingId, newReview) => {
    // Optimistically update the map so the edit/rate button updates instantly
    setReviewMap(prev => ({ ...prev, [bookingId]: newReview }));
    refetch();
  };

  const filteredBookings = useMemo(() => {
    const data = Array.isArray(bookings) ? bookings : [];
    return data.filter(b => {
      const date       = new Date(b.createdAt);
      const yearMatch  = date.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || date.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [bookings, selectedMonth, selectedYear]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear, viewMode]);

  if (loading) return <Loader />;

  const activeRides = filteredBookings.filter(b => ['active', 'booked'].includes(b.status));
  const pastRides   = filteredBookings.filter(b => !['active', 'booked'].includes(b.status));

  // ── Inline review section shown below each completed RideCard ──
  const ReviewSection = ({ b }) => {
    const review = reviewMap[b.id];
    if (b.status !== 'completed') return null;

    if (review) {
      // Already reviewed — show stars + comment + Edit button
      return (
        <div className="mt-2 ml-1 flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
          <div className="flex flex-col gap-1 min-w-0">
            <StarDisplay rating={review.rating} />
            {review.comment && (
              <span className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                "{review.comment}"
              </span>
            )}
          </div>
          <button
            onClick={() => openEditReview(b, review)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all active:scale-95"
            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'Space Grotesk' }}
          >
            <Pencil size={11} /> Edit
          </button>
        </div>
      );
    }

    if (review === null) {
      // No review yet — show Rate button
      return (
        <div className="mt-2 ml-1">
          <button
            onClick={() => openNewReview(b)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: 'rgba(250,204,21,0.08)', border: '1px dashed rgba(250,204,21,0.4)', color: '#b45309', fontFamily: 'Space Grotesk' }}
          >
            <Star size={13} fill="#facc15" style={{ color: '#facc15' }} /> Rate this ride
          </button>
        </div>
      );
    }

    return null; // loading state
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto page-enter">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>My Rides</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-xs font-bold appearance-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
              <option value="all">All Months</option>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold appearance-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border ml-1" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'shadow-sm' : 'opacity-40'}`}
              style={{ background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-primary)' }}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'shadow-sm' : 'opacity-40'}`}
              style={{ background: viewMode === 'table' ? 'var(--accent)' : 'transparent', color: viewMode === 'table' ? '#fff' : 'var(--text-primary)' }}>
              <TableIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-8">
              {activeRides.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk', color: 'var(--success)' }}>Active / Booked</h2>
                  </div>
                  <div className="space-y-3">
                    {activeRides.map(b => (
                      <RideCard key={b.id} booking={b} onComplete={confirmComplete} onCancel={confirmCancel} />
                    ))}
                  </div>
                </div>
              )}
              {pastRides.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>Past Rides</h2>
                  <div className="space-y-3">
                    {pastRides.map(b => (
                      <div key={b.id}>
                        <RideCard booking={b} onComplete={confirmComplete} onCancel={confirmCancel} />
                        <ReviewSection b={b} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Table view */
            <div className="rounded-2xl overflow-hidden border bg-[var(--bg-card)] shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead style={{ background: 'var(--bg-input)' }}>
                    <tr>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Cycle</th>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Date</th>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Review</th>
                      <th className="p-4 text-[10px] font-bold uppercase text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {paginatedData.map((b) => {
                      const review = reviewMap[b.id];
                      return (
                        <tr key={b.id} className="hover:bg-[var(--bg-input)] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <CycleThumbnail cycle={b.cycle} />
                              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{b.cycle?.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.createdAt)}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase"
                              style={{ background: ['booked','active'].includes(b.status) ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: ['booked','active'].includes(b.status) ? 'var(--success)' : 'var(--text-muted)' }}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {b.status === 'completed' && (
                              review
                                ? (
                                  <div className="flex items-center gap-2">
                                    <StarDisplay rating={review.rating} />
                                    <button onClick={() => openEditReview(b, review)}
                                      className="p-1 rounded-lg transition-colors"
                                      style={{ color: 'var(--text-muted)' }}
                                      title="Edit review">
                                      <Pencil size={12} />
                                    </button>
                                  </div>
                                )
                                : review === null
                                ? (
                                  <button onClick={() => openNewReview(b)}
                                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
                                    style={{ background: 'rgba(250,204,21,0.1)', color: '#b45309', border: '1px dashed rgba(250,204,21,0.4)' }}>
                                    <Star size={11} fill="#facc15" style={{ color: '#facc15' }} /> Rate
                                  </button>
                                )
                                : <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {(b.status === 'booked' || b.status === 'active') && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => confirmComplete(b.id)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"><CheckCircle2 size={18} /></button>
                                <button onClick={() => confirmCancel(b.id)}   className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><XCircle size={18} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1}          onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border disabled:opacity-30"><ChevronLeft  size={16} /></button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border disabled:opacity-30"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-4 opacity-30">🚲</div>
          <p className="font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-secondary)' }}>No rides found for this period</p>
        </div>
      )}

      <Popup open={popup.open && popup.type === 'complete'} onClose={() => setPopup({ open: false, type: '', id: null })} onConfirm={handleAction}
        title="Complete Ride" message="Are you sure you want to end this ride?" confirmText="Yes, Complete" cancelText="Not yet" variant="confirm" loading={actionLoading} />
      <Popup open={popup.open && popup.type === 'cancel'}   onClose={() => setPopup({ open: false, type: '', id: null })} onConfirm={handleAction}
        title="Cancel Booking" message="Are you sure you want to cancel this booking?" confirmText="Yes, Cancel" cancelText="Keep Booking" variant="danger" loading={actionLoading} />

      {reviewModal && (
        <ReviewModal
          booking={reviewModal.booking}
          existing={reviewModal.existing}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => handleReviewSubmitted(
            reviewModal.booking.id,
            // Temp optimistic value so UI updates before refetch
            { ...(reviewModal.existing || {}), rating: reviewModal.existing?.rating || 1 }
          )}
        />
      )}
    </div>
  );
};

export default MyRides;