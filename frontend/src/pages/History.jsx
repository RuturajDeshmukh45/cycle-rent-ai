import { useState, useMemo, useEffect } from 'react';
import { getRideHistory } from '../services/booking.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { formatDate, formatDuration } from '../utils/helpers';
import { Clock, DollarSign, Bike, List, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };
const typeColor = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };

const safeCost = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };
const safeDuration = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

// Small cycle thumbnail: 44×44 with image or emoji fallback
const CycleThumbnail = ({ cycle }) => {
  const [imgError, setImgError] = useState(false);
  const color = typeColor[cycle?.cycle_type] || '#3b82f6';
  const emoji = typeEmoji[cycle?.cycle_type] || '🚲';
  const showImage = !!(cycle?.image_url && !imgError);

  return (
    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
      style={{ background: showImage ? 'transparent' : `radial-gradient(circle, ${color}22, var(--bg-input) 70%)`, border: '1px solid var(--border)' }}>
      {showImage ? (
        <img src={cycle.image_url} alt={cycle?.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xl">{emoji}</div>
      )}
    </div>
  );
};

const History = () => {
  const { data: history, loading } = useFetch(getRideHistory);
  const [viewMode, setViewMode] = useState('list');
  
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2024", "2025", "2026"];

  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear, viewMode]);

  const filteredRides = useMemo(() => {
    const rides = Array.isArray(history) ? history : [];
    return rides.filter(ride => {
      const date = new Date(ride.createdAt);
      const yearMatch = date.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || date.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [history, selectedMonth, selectedYear]);

  const totalPages = Math.ceil(filteredRides.length / pageSize);
  const paginatedRides = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRides.slice(start, start + pageSize);
  }, [filteredRides, currentPage]);

  if (loading) return <Loader />;

  const totalSpent = filteredRides.reduce((s, r) => s + safeCost(r.total_cost), 0);
  const totalRides = filteredRides.length;
  const avgDuration = totalRides
    ? filteredRides.reduce((s, r) => s + safeDuration(r.duration_hours), 0) / totalRides
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Ride History
          </h1>
          <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
            Viewing records for {selectedMonth === 'all' ? 'Full Year' : months[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl text-xs font-bold appearance-none cursor-pointer border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}
            >
              <option value="all">All Months</option>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>

          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold appearance-none cursor-pointer border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Rides', value: totalRides, icon: Bike, color: 'var(--accent)' },
          { label: 'Spent', value: `₹ ${totalSpent.toFixed(2)}`, icon: DollarSign, color: '#10b981' },
          { label: 'Avg Time', value: `${avgDuration.toFixed(1)}h`, icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 relative bg-[var(--bg-card)] border" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute top-0 left-4 w-8 h-0.5" style={{ background: color }} />
            <div className="flex items-center justify-between mb-2">
              <Icon size={16} style={{ color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      {filteredRides.length ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="rounded-2xl p-3 flex items-center gap-3 border hover:border-[var(--accent)] transition-all bg-[var(--bg-card)]" style={{ borderColor: 'var(--border)' }}>
                  {/* Small image thumbnail — Bug 1 fix for History */}
                  <CycleThumbnail cycle={ride.cycle} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{ride.cycle?.name}</p>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{formatDate(ride.createdAt)} • {formatDuration(ride.duration_hours)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>₹{safeCost(ride.total_cost).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border bg-[var(--bg-card)]" style={{ borderColor: 'var(--border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead style={{ background: 'var(--bg-input)' }}>
                    <tr>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Cycle</th>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Date</th>
                      <th className="p-4 text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Duration</th>
                      <th className="p-4 text-[10px] font-bold uppercase text-right" style={{ color: 'var(--text-muted)' }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {paginatedRides.map((ride) => (
                      <tr key={ride.id} className="hover:bg-[var(--bg-input)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <CycleThumbnail cycle={ride.cycle} />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{ride.cycle?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(ride.createdAt)}</td>
                        <td className="p-4 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{formatDuration(ride.duration_hours)}</td>
                        <td className="p-4 text-right text-sm font-extrabold" style={{ color: 'var(--accent)' }}>₹{safeCost(ride.total_cost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRides.length)} of {filteredRides.length}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center px-3 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      Page {currentPage} of {totalPages}
                    </div>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
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
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>No records found</p>
        </div>
      )}
    </div>
  );
};

export default History;