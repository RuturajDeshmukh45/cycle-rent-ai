import { useState, useMemo, useEffect } from 'react';
import { completeBooking, cancelBooking, getMyRides } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import RideCard from '../components/booking/RideCard';
import Popup from '../components/comman/Popup';
import toast from 'react-hot-toast';
import { List, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const MyRides = () => {
  const { data: bookings, loading, refetch } = useFetch(getMyRides);
  const [popup, setPopup] = useState({ open: false, type: '', id: null });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Layout & Filter States
  const [viewMode, setViewMode] = useState('list');
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2024", "2025", "2026"];

  const confirmComplete = (id) => setPopup({ open: true, type: 'complete', id });
  const confirmCancel = (id) => setPopup({ open: true, type: 'cancel', id });

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (popup.type === 'complete') {
        await completeBooking(popup.id);
        toast.success('Ride completed! 🎉');
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

  // Filter Logic
  const filteredBookings = useMemo(() => {
    const data = Array.isArray(bookings) ? bookings : [];
    return data.filter(b => {
      const date = new Date(b.createdAt);
      const yearMatch = date.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || date.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [bookings, selectedMonth, selectedYear]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear, viewMode]);

  if (loading) return <Loader />;

  const active = filteredBookings.filter(b => ['active', 'booked'].includes(b.status));
  const past = filteredBookings.filter(b => !['active', 'booked'].includes(b.status));

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>My Rides</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar Selects */}
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl text-xs font-bold appearance-none border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}
            >
              <option value="all">All Months</option>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>

          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold appearance-none border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border ml-2" style={{ borderColor: 'var(--border)' }}>
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
              {active.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk', color: 'var(--success)' }}>Active / Booked</h2>
                  </div>
                  <div className="space-y-3">
                    {active.map(b => <RideCard key={b.id} booking={b} onComplete={confirmComplete} onCancel={confirmCancel} />)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>Past Rides</h2>
                  <div className="space-y-3">
                    {past.map(b => <RideCard key={b.id} booking={b} onComplete={confirmComplete} onCancel={confirmCancel} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border bg-[var(--bg-card)] shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-left border-collapse">
                <thead style={{ background: 'var(--bg-input)' }}>
                  <tr>
                    <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Cycle</th>
                    <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Date</th>
                    <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="p-4 text-[10px] font-bold uppercase text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {paginatedData.map((b) => (
                    <tr key={b.id} className="hover:bg-[var(--bg-input)] transition-colors">
                      <td className="p-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{b.cycle?.name}</td>
                      <td className="p-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.createdAt)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase`} 
                          style={{ 
                            background: b.status === 'booked' || b.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                            color: b.status === 'booked' || b.status === 'active' ? 'var(--success)' : 'var(--text-muted)'
                          }}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(b.status === 'booked' || b.status === 'active') && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => confirmComplete(b.id)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors" title="Complete">
                              <CheckCircle2 size={18} />
                            </button>
                            <button onClick={() => confirmCancel(b.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Cancel">
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border disabled:opacity-30">
                      <ChevronLeft size={16} />
                    </button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border disabled:opacity-30">
                      <ChevronRight size={16} />
                    </button>
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

      {/* Popups remain the same */}
      <Popup
        open={popup.open && popup.type === 'complete'}
        onClose={() => setPopup({ open: false, type: '', id: null })}
        onConfirm={handleAction}
        title="Complete Ride"
        message="Are you sure you want to end this ride?"
        confirmText="Yes, Complete"
        cancelText="Not yet"
        variant="confirm"
        loading={actionLoading}
      />

      <Popup
        open={popup.open && popup.type === 'cancel'}
        onClose={() => setPopup({ open: false, type: '', id: null })}
        onConfirm={handleAction}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default MyRides;