import { useState, useRef, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getAllCycles, createCycle, updateCycle } from '../../services/cycle.service';
import { getAllBookings, getAdminStats } from '../../services/booking.service';
import { getAllReviews } from '../../services/review.service';
import api from '../../services/api';
import Loader from '../../components/comman/Loader';
import Popup from '../../components/comman/Popup';
import toast from 'react-hot-toast';
import {
  Bike, Plus, Edit2, Trash2, Eye, CheckCircle, Clock, XCircle,
  BarChart2, Users, Package, History, Upload, X, Image as ImageIcon,
  AlertTriangle, Search, Filter, TrendingUp, List, Table as TableIcon,
  ChevronLeft, ChevronRight, CalendarDays, DollarSign, Activity, ArrowUpRight, ShieldAlert, Zap, Star, MessageSquare
} from 'lucide-react';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };
const typeColor  = { electric: '#22c55e', mountain: '#f59e0b', standard: '#3b82f6' };

const statusColors = {
  available:   { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', label: 'Available'   },
  booked:      { bg: 'rgba(59,130,246,0.1)',   color: '#2563eb', label: 'Booked'      },
  maintenance: { bg: 'rgba(245,158,11,0.1)',   color: '#d97706', label: 'Maintenance' },
};
const bookingColors = {
  active:    { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a' },
  booked:    { bg: 'rgba(59,130,246,0.1)',   color: '#2563eb' },
  completed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
  pending:   { bg: 'rgba(245,158,11,0.1)',   color: '#d97706' },
};

const EMPTY_CYCLE = { name: '', cycle_type: 'standard', location: '', price_per_hour: '', status: 'available', description: '' };

const CycleThumbnail = ({ cycle, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);
  const color     = typeColor[cycle?.cycle_type] || '#3b82f6';
  const emoji     = typeEmoji[cycle?.cycle_type] || '🚲';
  const showImage = !!(cycle?.image_url && !imgError);
  const cls       = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-xl';

  return (
    <div
      className={`${cls} rounded-xl overflow-hidden shrink-0`}
      style={{
        background: showImage ? 'transparent' : `radial-gradient(circle, ${color}22, var(--bg-input) 70%)`,
        border: '1px solid var(--border)',
      }}
    >
      {showImage ? (
        <img src={cycle.image_url} alt={cycle?.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">{emoji}</div>
      )}
    </div>
  );
};

const safeCost     = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const safeDuration = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const formatDate   = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const formatDur    = (h) => {
  const n = safeDuration(h);
  if (!n) return '—';
  if (n < 1) return `${Math.round(n * 60)}m`;
  return `${n.toFixed(1)}h`;
};

const AdminPanel = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (location.pathname.includes('analytics') || location.search.includes('analytics')) {
      setActiveTab('analytics');
    } else {
      setActiveTab('overview');
    }
  }, [location]);

  const { data: cycles,   loading: cyclesLoading,   refetch: refetchCycles   } = useFetch(getAllCycles);
  const { data: bookings, loading: bookingsLoading, refetch: refetchBookings } = useFetch(getAllBookings);
  const { data: stats }                                                        = useFetch(getAdminStats);
  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useFetch(getAllReviews);

  // Cycle form state
  const [cycleForm,      setCycleForm]      = useState(EMPTY_CYCLE);
  const [editingCycle,   setEditingCycle]   = useState(null);
  const [imageFile,      setImageFile]      = useState(null);
  const [imagePreview,   setImagePreview]   = useState('');
  const [formLoading,    setFormLoading]    = useState(false);
  const [showCycleForm,  setShowCycleForm]  = useState(false);
  const fileInputRef = useRef(null);

  // Popups
  const [deletePopup,      setDeletePopup]      = useState({ open: false, cycle: null });
  const [viewBookingPopup, setViewBookingPopup] = useState({ open: false, booking: null });
  const [deleteLoading,    setDeleteLoading]    = useState(false);

  // Search / filter
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [bookingFilter, setBookingFilter] = useState('');

  // Bookings view mode & pagination updates
  const [bookingsViewMode, setBookingsViewMode] = useState('table'); 
  const [bookingsPage, setBookingsPage] = useState(1);
  const bookingsPageSize = 8;

  // History tab state
  const currentYear = new Date().getFullYear();
  const [historyViewMode,   setHistoryViewMode]   = useState('table');
  const [historyMonth,      setHistoryMonth]      = useState('all');
  const [historyYear,       setHistoryYear]       = useState(currentYear.toString());
  const [historyPage,       setHistoryPage]       = useState(1);
  const historyPageSize = 8;

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years  = ['2024','2025','2026'];

  useEffect(() => { setHistoryPage(1); }, [historyMonth, historyYear, historyViewMode]);
  useEffect(() => { setBookingsPage(1); }, [bookingFilter, bookingsViewMode]);

  const filteredHistory = useMemo(() => {
    const rides = Array.isArray(bookings) ? bookings : [];
    return rides.filter(ride => {
      const date = new Date(ride.createdAt || ride.start_time);
      const yearMatch  = date.getFullYear().toString() === historyYear;
      const monthMatch = historyMonth === 'all' || date.getMonth().toString() === historyMonth;
      return yearMatch && monthMatch;
    });
  }, [bookings, historyMonth, historyYear]);

  const historyTotalPages  = Math.ceil(filteredHistory.length / historyPageSize);
  const paginatedHistory   = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize;
    return filteredHistory.slice(start, start + historyPageSize);
  }, [filteredHistory, historyPage]);

  // Cycle CRUD
  const openAdd = () => {
    setEditingCycle(null); setCycleForm(EMPTY_CYCLE);
    setImageFile(null); setImagePreview(''); setShowCycleForm(true);
  };
  const openEdit = (cycle) => {
    setEditingCycle(cycle);
    setCycleForm({ name: cycle.name, cycle_type: cycle.cycle_type, location: cycle.location, price_per_hour: cycle.price_per_hour, status: cycle.status, description: cycle.description || '' });
    setImageFile(null); setImagePreview(cycle.image_url || ''); setShowCycleForm(true);
  };
  const closeForm = () => { setShowCycleForm(false); setEditingCycle(null); setImageFile(null); setImagePreview(''); };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!cycleForm.name || !cycleForm.location || !cycleForm.price_per_hour) { toast.error('Please fill all required fields'); return; }
    setFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(cycleForm).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editingCycle) { await api.put(`/cycles/${editingCycle.id}`, fd); toast.success('Cycle updated! ✅'); }
      else              { await api.post('/cycles', fd); toast.success('Cycle added! 🚲'); }
      refetchCycles(); closeForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save cycle'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deletePopup.cycle) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/cycles/${deletePopup.cycle.id}`);
      toast.success('Cycle deleted'); refetchCycles();
      setDeletePopup({ open: false, cycle: null });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleteLoading(false); }
  };

  // Derived stats
  const totalRevenue      = bookings?.filter(b => b.status === 'completed').reduce((s, b) => s + parseFloat(b.total_cost || 0), 0) || 0;
  const activeBookings    = bookings?.filter(b => ['active', 'booked'].includes(b.status)).length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const pendingBookings   = bookings?.filter(b => b.status === 'pending').length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === 'completed' ? 0 : b.status === 'cancelled' ? 1 : 0).length || bookings?.filter(b => b.status === 'cancelled').length || 0;
  const availableCycles   = cycles?.filter(c => c.status === 'available').length || 0;

  // Filtered lists
  const filteredCycles = cycles?.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const filteredBookings = bookings?.filter(b => !bookingFilter || b.status === bookingFilter) || [];

  const bookingsTotalPages = Math.ceil(filteredBookings.length / bookingsPageSize);
  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * bookingsPageSize;
    return filteredBookings.slice(start, start + bookingsPageSize);
  }, [filteredBookings, bookingsPage]);

  const revenueByType = useMemo(() => {
    const map = { electric: 0, mountain: 0, standard: 0 };
    bookings?.filter(b => b.status === 'completed').forEach(b => {
      const t = b.cycle?.cycle_type || 'standard';
      map[t] = (map[t] || 0) + parseFloat(b.total_cost || 0);
    });
    return map;
  }, [bookings]);

  const topCycles = useMemo(() => {
    const map = {};
    bookings?.forEach(b => {
      const name = b.cycle?.name || `Cycle #${b.cycle_id}`;
      const img  = b.cycle?.image_url || '';
      const type = b.cycle?.cycle_type || 'standard';
      if (!map[name]) map[name] = { name, img, type, count: 0, revenue: 0 };
      map[name].count++;
      if (b.status === 'completed') map[name].revenue += parseFloat(b.total_cost || 0);
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [bookings]);

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: BarChart2  },
    { id: 'cycles',     label: 'Cycles',     icon: Bike       },
    { id: 'bookings',   label: 'Bookings',   icon: Package    },
    { id: 'history',    label: 'History',    icon: History    },
    { id: 'analytics',  label: 'Analytics',  icon: TrendingUp },
    { id: 'reviews',    label: 'Reviews',    icon: Star       },
  ];

  const histTotalSpent   = filteredHistory.reduce((s, r) => s + safeCost(r.total_cost), 0);
  const histTotalRides   = filteredHistory.length;
  const histAvgDuration  = histTotalRides ? filteredHistory.reduce((s, r) => s + safeDuration(r.duration_hours), 0) / histTotalRides : 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Admin Panel</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Manage cycles, bookings, and platform stats</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', fontFamily: 'Space Grotesk' }}>
            🔑 Administrator
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              fontFamily: 'Space Grotesk',
              background: activeTab === id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === id ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: activeTab === id ? 'var(--shadow-sm)' : 'none',
            }}>
            <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Cycles',     value: stats?.totalCycles  ?? cycles?.length ?? 0,                               icon: Bike,       color: 'var(--accent)', bg: 'rgba(34,197,94,0.1)'   },
              { label: 'Available',        value: stats?.availableCycles ?? availableCycles,                                icon: CheckCircle, color: '#22c55e',       bg: 'rgba(34,197,94,0.08)'  },
              { label: 'Active Bookings', value: stats?.activeBookings ?? activeBookings,                                  icon: Clock,       color: '#3b82f6',       bg: 'rgba(59,130,246,0.1)'   },
              { label: 'Total Revenue',   value: `₹${(stats?.totalRevenue ?? totalRevenue).toFixed(0)}`,                  icon: BarChart2,   color: '#8b5cf6',       bg: 'rgba(139,92,246,0.1)'   },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Booking Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active',    value: stats?.activeBookings    ?? activeBookings,                                         color: '#3b82f6' },
                { label: 'Pending',   value: stats?.pendingBookings   ?? pendingBookings,                                        color: '#f59e0b' },
                { label: 'Completed', value: stats?.completedBookings ?? completedBookings,                                       color: '#22c55e' },
                { label: 'Cancelled', value: stats?.cancelledBookings ?? cancelledBookings,                                       color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {stats?.totalUsers !== undefined && (
            <div className="rounded-2xl p-4 mt-4 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Users size={18} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: '#3b82f6' }}>{stats.totalUsers}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Registered Users</p>
              </div>
              <div className="ml-auto text-xs px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.08)', color: 'var(--accent)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                Total Bookings: {stats.totalBookings}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CYCLES */}
      {activeTab === 'cycles' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto flex-1 max-w-2xl">
              <div className="relative flex-1 sm:max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  className="input-field pr-4 py-2 text-sm w-full" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="Search cycles…" 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <select 
                className="input-field px-3 py-2 text-sm w-full sm:w-48 cursor-pointer" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button onClick={openAdd} className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold w-full sm:w-auto shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'Space Grotesk' }}>
              <Plus size={14} /> Add Cycle
            </button>
          </div>

          {cyclesLoading ? <Loader /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCycles.map(cycle => (
                <div key={cycle.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="relative h-40 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                    {cycle.image_url ? (
                      <img src={cycle.image_url} alt={cycle.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">{typeEmoji[cycle.cycle_type] || '🚲'}</div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{ background: statusColors[cycle.status]?.bg || 'rgba(107,114,128,0.1)', color: statusColors[cycle.status]?.color || '#6b7280' }}>
                      {statusColors[cycle.status]?.label || cycle.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{cycle.name}</h3>
                      <span className="text-base font-extrabold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>₹{cycle.price_per_hour}/hr</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>📍 {cycle.location} · {typeEmoji[cycle.cycle_type]} {cycle.cycle_type}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cycle)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)', fontFamily: 'Space Grotesk' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setDeletePopup({ open: true, cycle })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'Space Grotesk' }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {['', 'active', 'booked', 'pending', 'completed', 'cancelled'].map(f => (
                <button key={f} onClick={() => setBookingFilter(f)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{
                    fontFamily: 'Space Grotesk',
                    background: bookingFilter === f ? 'var(--accent)' : 'var(--bg-input)',
                    color: bookingFilter === f ? '#fff' : 'var(--text-secondary)',
                    border: bookingFilter === f ? 'none' : '1px solid var(--border)',
                  }}>
                  {f || 'All'} ({(f ? bookings?.filter(b => b.status === f) : bookings)?.length || 0})
                </button>
              ))}
            </div>
            
            <div className="flex p-1 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
              <button onClick={() => setBookingsViewMode('list')}
                className="p-1.5 rounded-lg transition-all"
                style={{ background: bookingsViewMode === 'list' ? 'var(--accent)' : 'transparent', color: bookingsViewMode === 'list' ? '#fff' : 'var(--text-muted)' }}>
                <List size={15} />
              </button>
              <button onClick={() => setBookingsViewMode('table')}
                className="p-1.5 rounded-lg transition-all"
                style={{ background: bookingsViewMode === 'table' ? 'var(--accent)' : 'transparent', color: bookingsViewMode === 'table' ? '#fff' : 'var(--text-muted)' }}>
                <TableIcon size={15} />
              </button>
            </div>
          </div>

          {bookingsLoading ? <Loader /> : !filteredBookings.length ? (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold" style={{ fontFamily: 'Space Grotesk' }}>No bookings found</p>
            </div>
          ) : (
            <>
              {bookingsViewMode === 'list' && (
                <div className="space-y-3">
                  {paginatedBookings.map(booking => (
                    <div key={booking.id} className="rounded-2xl p-4 flex items-center gap-4"
                      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                      <CycleThumbnail cycle={booking.cycle} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                            {booking.user?.name || `User #${booking.user_id}`}
                          </p>
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                            style={{ background: bookingColors[booking.status]?.bg || 'rgba(107,114,128,0.1)', color: bookingColors[booking.status]?.color || '#6b7280' }}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {booking.cycle?.name || `Cycle #${booking.cycle_id}`} · {booking.pickup_location || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(booking.start_time || booking.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {booking.total_cost && (
                          <p className="font-extrabold text-base" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                            ₹{parseFloat(booking.total_cost).toFixed(2)}
                          </p>
                        )}
                        <button onClick={() => setViewBookingPopup({ open: true, booking })}
                          className="mt-1 flex items-center gap-1 text-xs font-semibold"
                          style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bookingsViewMode === 'table' && (
                <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead style={{ background: 'var(--bg-input)' }}>
                        <tr>
                          {['Cycle', 'User', 'Date', 'Route', 'Status', 'Cost', 'Action'].map(h => (
                            <th key={h} className="p-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((booking, idx) => (
                          <tr key={booking.id}
                            style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <CycleThumbnail cycle={booking.cycle} />
                                <span className="text-xs font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                  {booking.cycle?.name || `#${booking.cycle_id}`}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                              {booking.user?.name || `User #${booking.user_id}`}
                            </td>
                            <td className="p-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(booking.start_time || booking.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="p-3 text-xs max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>
                              {booking.pickup_location ? `${booking.pickup_location} → ${booking.drop_location || '—'}` : '—'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap"
                                style={{ background: bookingColors[booking.status]?.bg || 'rgba(107,114,128,0.1)', color: bookingColors[booking.status]?.color || '#6b7280' }}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm font-extrabold text-right whitespace-nowrap" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                              {booking.total_cost ? `₹${parseFloat(booking.total_cost).toFixed(2)}` : '—'}
                            </td>
                            <td className="p-3">
                              <button onClick={() => setViewBookingPopup({ open: true, booking })}
                                className="flex items-center gap-1 text-xs font-semibold"
                                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Eye size={11} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bookingsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Showing {((bookingsPage - 1) * bookingsPageSize) + 1}–{Math.min(bookingsPage * bookingsPageSize, filteredBookings.length)} of {filteredBookings.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button disabled={bookingsPage === 1} onClick={() => setBookingsPage(p => p - 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-xs font-bold px-3" style={{ color: 'var(--text-primary)' }}>
                      {bookingsPage} / {bookingsTotalPages}
                    </span>
                    <button disabled={bookingsPage === bookingsTotalPages} onClick={() => setBookingsPage(p => p + 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* HISTORY */}
      {activeTab === 'history' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Viewing: {historyMonth === 'all' ? 'Full Year' : months[Number(historyMonth)]} {historyYear}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
                <select value={historyMonth} onChange={e => setHistoryMonth(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-xl text-xs font-bold border appearance-none cursor-pointer"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                  <option value="all">All Months</option>
                  {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <select value={historyYear} onChange={e => setHistoryYear(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-bold border appearance-none cursor-pointer"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="flex p-1 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                <button onClick={() => setHistoryViewMode('list')}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: historyViewMode === 'list' ? 'var(--accent)' : 'transparent', color: historyViewMode === 'list' ? '#fff' : 'var(--text-muted)' }}>
                  <List size={15} />
                </button>
                <button onClick={() => setHistoryViewMode('table')}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: historyViewMode === 'table' ? 'var(--accent)' : 'transparent', color: historyViewMode === 'table' ? '#fff' : 'var(--text-muted)' }}>
                  <TableIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Rides',     value: histTotalRides,           icon: Bike,        color: 'var(--accent)' },
              { label: 'Revenue',  value: `₹${histTotalSpent.toFixed(0)}`,         icon: DollarSign,  color: '#10b981'       },
              { label: 'Avg Time', value: formatDur(histAvgDuration),              icon: Clock,       color: '#f59e0b'       },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-4 relative border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="absolute top-0 left-4 w-8 h-0.5" style={{ background: color }} />
                <div className="flex items-center justify-between mb-2">
                  <Icon size={15} style={{ color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {bookingsLoading ? <Loader /> : filteredHistory.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
              <History size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>No records found</p>
            </div>
          ) : (
            <>
              {historyViewMode === 'list' && (
                <div className="space-y-3">
                  {paginatedHistory.map(ride => (
                    <div key={ride.id} className="rounded-2xl p-3 flex items-center gap-3 border transition-all"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <CycleThumbnail cycle={ride.cycle} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                          {ride.user?.name || `User #${ride.user_id}`} — {ride.cycle?.name || `Cycle #${ride.cycle_id}`}
                        </p>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(ride.start_time || ride.createdAt)}
                          {ride.end_time && ` → ${new Date(ride.end_time).toLocaleString('en-IN', { timeStyle: 'short' })}`}
                        </p>
                        {ride.pickup_location && (
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {ride.pickup_location} → {ride.drop_location || '—'}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold block mb-1"
                          style={{ background: bookingColors[ride.status]?.bg || 'rgba(107,114,128,0.1)', color: bookingColors[ride.status]?.color || '#6b7280' }}>
                          {ride.status}
                        </span>
                        {ride.total_cost && (
                          <p className="text-sm font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                            ₹{safeCost(ride.total_cost).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {historyViewMode === 'table' && (
                <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead style={{ background: 'var(--bg-input)' }}>
                        <tr>
                          {['Cycle', 'User', 'Date', 'Route', 'Duration', 'Status', 'Cost'].map(h => (
                            <th key={h} className="p-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.map((ride, idx) => (
                          <tr key={ride.id}
                            style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <CycleThumbnail cycle={ride.cycle} />
                                <span className="text-xs font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                                  {ride.cycle?.name || `#${ride.cycle_id}`}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                              {ride.user?.name || `User #${ride.user_id}`}
                            </td>
                            <td className="p-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(ride.start_time || ride.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="p-3 text-xs max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>
                              {ride.pickup_location ? `${ride.pickup_location} → ${ride.drop_location || '—'}` : '—'}
                            </td>
                            <td className="p-3 text-xs font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                              {formatDur(ride.duration_hours)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap"
                                style={{ background: bookingColors[ride.status]?.bg || 'rgba(107,114,128,0.1)', color: bookingColors[ride.status]?.color || '#6b7280' }}>
                                {ride.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm font-extrabold text-right whitespace-nowrap" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                              {ride.total_cost ? `₹${safeCost(ride.total_cost).toFixed(2)}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Showing {((historyPage - 1) * historyPageSize) + 1}–{Math.min(historyPage * historyPageSize, filteredHistory.length)} of {filteredHistory.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-xs font-bold px-3" style={{ color: 'var(--text-primary)' }}>
                      {historyPage} / {historyTotalPages}
                    </span>
                    <button disabled={historyPage === historyTotalPages} onClick={() => setHistoryPage(p => p + 1)}
                      className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ANALYTICS SUB-TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Ride Ticket', value: completedBookings ? `₹${(totalRevenue / completedBookings).toFixed(1)}` : '₹0', icon: Activity, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
              { label: 'Active Utilization', value: cycles?.length ? `${((bookings?.filter(b => b.status === 'active').length || 0) / cycles.length * 100).toFixed(0)}%` : '0%', icon: ArrowUpRight, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Cancellation Rate', value: bookings?.length ? `${((cancelledBookings / bookings.length) * 100).toFixed(1)}%` : '0%', icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
              { label: 'Completion Ratio', value: bookings?.length ? `${((completedBookings / bookings.length) * 100).toFixed(1)}%` : '0%', icon: CheckCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
            ].map((card, i) => (
              <div key={i} className="rounded-2xl p-4 border relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                    <card.icon size={15} style={{ color: card.color }} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-primary)' }}>Ratios</span>
                </div>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{card.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                Revenue Generation Streams
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(revenueByType).map(([type, rev]) => {
                const color = typeColor[type] || '#6b7280';
                const totalRevSum = Object.values(revenueByType).reduce((a, b) => a + b, 0) || 1;
                const percentage = ((rev / totalRevSum) * 100).toFixed(0);
                return (
                  <div key={type} className="rounded-xl p-4 border relative" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{typeEmoji[type] || '🚲'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase" style={{ background: `${color}15`, color }}>
                        {percentage}% Share
                      </span>
                    </div>
                    <p className="text-lg font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>₹{rev.toFixed(0)}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{type} Class Model</p>
                    <div className="w-full h-1 mt-3 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                📊 Structural Log Distribution
              </h2>
              <span className="text-[10px] font-bold opacity-50" style={{ color: 'var(--text-primary)' }}>Total: {bookings?.length || 0} Logs</span>
            </div>
            {(() => {
              const total = bookings?.length || 1;
              const groups = [
                { label: 'Completed', count: completedBookings, color: '#22c55e' },
                { label: 'Active Rented', count: activeBookings,    color: '#3b82f6' },
                { label: 'Pending Hold',  count: pendingBookings,   color: '#f59e0b' },
                { label: 'Cancelled Out', count: cancelledBookings, color: '#ef4444' },
              ];
              return (
                <>
                  <div className="flex rounded-xl overflow-hidden h-4 mb-4 bg-black/5 dark:bg-white/5">
                    {groups.map(g => g.count > 0 && (
                      <div key={g.label} style={{ width: `${(g.count / total) * 100}%`, background: g.color }} title={`${g.label}: ${g.count}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {groups.map(g => (
                      <div key={g.label} className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.color }} />
                        <div>
                          <p className="text-xs font-black" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                            {g.count} <span className="font-normal opacity-40">({((g.count/total)*100).toFixed(0)}%)</span>
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{g.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              🏆 Top Capital Models by Conversion
            </h2>
            {topCycles.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No logs registered yet</p>
            ) : (
              <div className="space-y-3.5">
                {topCycles.map((c, idx) => {
                  const maxCount = topCycles[0]?.count || 1;
                  const color    = typeColor[c.type] || '#6b7280';
                  return (
                    <div key={c.name} className="flex items-center gap-3 group">
                      <span className="text-xs font-black w-6 text-center shrink-0" style={{ color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309', fontFamily: 'Space Grotesk' }}>
                        0{idx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-black/5" style={{ background: 'var(--bg-input)' }}>
                        {c.img ? (
                          <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-base">{typeEmoji[c.type] || '🚲'}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold truncate pr-2" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{c.name}</p>
                          <p className="text-xs font-extrabold shrink-0" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>₹{c.revenue.toFixed(0)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(c.count / maxCount) * 100}%`, background: color }} />
                          </div>
                          <span className="text-[10px] font-bold shrink-0 opacity-50" style={{ color: 'var(--text-primary)' }}>{c.count} rides</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (() => {
        const reviews = Array.isArray(reviewsData) ? reviewsData : [];
        
        // Aggregate stats
        const avgRating = reviews.length
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          : '—';
        const dist = [5,4,3,2,1].map(s => ({
          star: s,
          count: reviews.filter(r => r.rating === s).length,
          pct: reviews.length ? Math.round(reviews.filter(r => r.rating === s).length / reviews.length * 100) : 0
        }));

        // Cycle summary: group reviews per cycle
        const cycleMap = {};
        reviews.forEach(r => {
          const cid = r.cycle?.id || r.cycle_id;
          const cname = r.cycle?.name || `Cycle #${cid}`;
          if (!cycleMap[cid]) cycleMap[cid] = { name: cname, reviews: [], total: 0 };
          cycleMap[cid].reviews.push(r);
          cycleMap[cid].total += r.rating;
        });
        const cycleSummaries = Object.values(cycleMap)
          .map(c => ({ ...c, avg: (c.total / c.reviews.length).toFixed(1) }))
          .sort((a, b) => b.avg - a.avg);

        return (
          <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                  Ride Reviews & Ratings
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} from users
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border"
                style={{ background: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.3)' }}>
                <Star size={18} fill="#facc15" style={{ color: '#facc15' }} />
                <span className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: '#b45309' }}>{avgRating}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 5.0</span>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-12"><div className="spinner w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
                <MessageSquare size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
                <p className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-secondary)' }}>No reviews yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Reviews appear after users complete rides</p>
              </div>
            ) : (
              <>
                {/* Top stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Rating distribution */}
                  <div className="sm:col-span-2 rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>
                      Rating Distribution
                    </p>
                    <div className="space-y-2.5">
                      {dist.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12 shrink-0">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{star}</span>
                            <Star size={11} fill="#facc15" style={{ color: '#facc15' }} />
                          </div>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: star >= 4 ? 'var(--accent)' : star === 3 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cycle leaderboard */}
                  <div className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>
                      Top Rated Cycles
                    </p>
                    <div className="space-y-3">
                      {cycleSummaries.slice(0, 5).map((c, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black w-4 shrink-0" style={{ color: 'var(--text-muted)' }}>#{i+1}</span>
                            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{c.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={11} fill="#facc15" style={{ color: '#facc15' }} />
                            <span className="text-xs font-bold" style={{ color: '#b45309' }}>{c.avg}</span>
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>({c.reviews.length})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* All Reviews Table */}
                <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                    <MessageSquare size={15} style={{ color: 'var(--accent)' }} />
                    <p className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                      All Reviews
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse">
                      <thead style={{ background: 'var(--bg-input)' }}>
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cycle</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rating</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Comment</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r, i) => (
                          <tr key={r.id || i} className="border-t hover:bg-[var(--bg-input)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                            {/* User */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                                  {r.user?.profileImage
                                    ? <img src={r.user.profileImage} className="w-full h-full object-cover" alt="" />
                                    : (r.user?.name?.[0] || '?').toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                                  {r.user?.name || `User #${r.user_id}`}
                                </span>
                              </div>
                            </td>
                            {/* Cycle */}
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {r.cycle?.name || `Cycle #${r.cycle_id}`}
                              </span>
                            </td>
                            {/* Rating */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={13} fill={s <= r.rating ? '#facc15' : 'none'}
                                      style={{ color: s <= r.rating ? '#facc15' : 'var(--border-strong)' }} />
                                  ))}
                                </div>
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg"
                                  style={{
                                    background: r.rating >= 4 ? 'rgba(34,197,94,0.1)' : r.rating === 3 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: r.rating >= 4 ? 'var(--success)' : r.rating === 3 ? '#d97706' : 'var(--danger)',
                                  }}>
                                  {r.rating}/5
                                </span>
                              </div>
                            </td>
                            {/* Comment */}
                            <td className="px-5 py-3.5 max-w-[240px]">
                              {r.comment ? (
                                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                  "{r.comment}"
                                </p>
                              ) : (
                                <span className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>No comment</span>
                              )}
                            </td>
                            {/* Date */}
                            <td className="px-5 py-3.5">
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* POPUPS & FORMS */}
      <Popup open={showCycleForm} onClose={closeForm} title={editingCycle ? 'Edit Cycle' : 'Add New Cycle'} variant="form">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Cycle Image</label>
            <div className="relative h-36 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--bg-input)', border: '1.5px dashed var(--border)' }}
              onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold"><Upload size={16} /> Change Image</div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Name *</label>
              <input className="input-field text-sm" value={cycleForm.name} onChange={e => setCycleForm(p => ({ ...p, name: e.target.value }))} placeholder="Cycle name" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Type</label>
              <select className="input-field text-sm" value={cycleForm.cycle_type} onChange={e => setCycleForm(p => ({ ...p, cycle_type: e.target.value }))}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="standard">🚲 Standard</option>
                <option value="electric">⚡ Electric</option>
                <option value="mountain">🏔️ Mountain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Location *</label>
              <input className="input-field text-sm" value={cycleForm.location} onChange={e => setCycleForm(p => ({ ...p, location: e.target.value }))} placeholder="Station location" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Price/hr (₹) *</label>
              <input className="input-field text-sm" type="number" value={cycleForm.price_per_hour} onChange={e => setCycleForm(p => ({ ...p, price_per_hour: e.target.value }))} placeholder="e.g. 30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Status</label>
            <select className="input-field text-sm" value={cycleForm.status} onChange={e => setCycleForm(p => ({ ...p, status: e.target.value }))}
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Description</label>
            <textarea className="input-field text-sm resize-none" rows={2} value={cycleForm.description}
              onChange={e => setCycleForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description…" />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: 'Space Grotesk' }}>
              Cancel
            </button>
            <button type="submit" disabled={formLoading} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'Space Grotesk' }}>
              {formLoading && <span className="spinner inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />}
              {editingCycle ? 'Save Changes' : 'Add Cycle'}
            </button>
          </div>
        </form>
      </Popup>

      <Popup
        open={deletePopup.open}
        onClose={() => setDeletePopup({ open: false, cycle: null })}
        onConfirm={handleDelete}
        title="Delete Cycle"
        message={`Are you sure you want to delete "${deletePopup.cycle?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      <Popup open={viewBookingPopup.open} onClose={() => setViewBookingPopup({ open: false, booking: null })} title="Booking Details" variant="form">
        {viewBookingPopup.booking && (
          <div className="space-y-3 text-sm">
            {[
              ['Booking ID', `#${viewBookingPopup.booking.id}`],
              ['User',       viewBookingPopup.booking.user?.name || `#${viewBookingPopup.booking.user_id}`],
              ['Cycle',      viewBookingPopup.booking.cycle?.name || `#${viewBookingPopup.booking.cycle_id}`],
              ['Status',     viewBookingPopup.booking.status],
              ['Pickup',     viewBookingPopup.booking.pickup_location || '—'],
              ['Drop',       viewBookingPopup.booking.drop_location || '—'],
              ['Start',      viewBookingPopup.booking.start_time ? new Date(viewBookingPopup.booking.start_time).toLocaleString('en-IN') : '—'],
              ['End',        viewBookingPopup.booking.end_time   ? new Date(viewBookingPopup.booking.end_time).toLocaleString('en-IN')   : 'Ongoing'],
              ['Duration',   viewBookingPopup.booking.duration_hours ? `${parseFloat(viewBookingPopup.booking.duration_hours).toFixed(2)} hrs` : '—'],
              ['Total Cost', viewBookingPopup.booking.total_cost ? `₹${parseFloat(viewBookingPopup.booking.total_cost).toFixed(2)}` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', fontWeights: 600 }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewBookingPopup({ open: false, booking: null })} className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: 'Space Grotesk' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default AdminPanel;