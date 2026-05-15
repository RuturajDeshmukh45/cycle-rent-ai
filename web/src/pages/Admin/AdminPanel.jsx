import { useState, useRef } from 'react';
import useFetch from '../../hooks/useFetch';
import { getAllCycles, createCycle, updateCycle } from '../../services/cycle.service';
import { getAllBookings, getAdminStats } from '../../services/booking.service';
import api from '../../services/api';
import Loader from '../../components/comman/Loader';
import Popup from '../../components/comman/Popup';
import toast from 'react-hot-toast';
import {
  Bike, Plus, Edit2, Trash2, Eye, CheckCircle, Clock, XCircle,
  BarChart2, Users, Package, History, Upload, X, Image as ImageIcon,
  AlertTriangle, Search, Filter
} from 'lucide-react';

const typeEmoji = { electric: '⚡', mountain: '🏔️', standard: '🚲' };
const statusColors = {
  available: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', label: 'Available' },
  booked: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', label: 'Booked' },
  maintenance: { bg: 'rgba(245,158,11,0.1)', color: '#d97706', label: 'Maintenance' },
};
const bookingColors = {
  active: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  booked: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  completed: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#d97706' },
};

const EMPTY_CYCLE = { name: '', cycle_type: 'standard', location: '', price_per_hour: '', status: 'available', description: '' };

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: cycles, loading: cyclesLoading, refetch: refetchCycles } = useFetch(getAllCycles);
  const { data: bookings, loading: bookingsLoading, refetch: refetchBookings } = useFetch(getAllBookings);
  const { data: stats } = useFetch(getAdminStats);

  // Cycle form state
  const [cycleForm, setCycleForm] = useState(EMPTY_CYCLE);
  const [editingCycle, setEditingCycle] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const fileInputRef = useRef(null);

  // Popups
  const [deletePopup, setDeletePopup] = useState({ open: false, cycle: null });
  const [viewBookingPopup, setViewBookingPopup] = useState({ open: false, booking: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search/filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingFilter, setBookingFilter] = useState('');

  // ── Cycle CRUD ──
  const openAdd = () => {
    setEditingCycle(null);
    setCycleForm(EMPTY_CYCLE);
    setImageFile(null);
    setImagePreview('');
    setShowCycleForm(true);
  };

  const openEdit = (cycle) => {
    setEditingCycle(cycle);
    setCycleForm({
      name: cycle.name,
      cycle_type: cycle.cycle_type,
      location: cycle.location,
      price_per_hour: cycle.price_per_hour,
      status: cycle.status,
      description: cycle.description || '',
    });
    setImageFile(null);
    setImagePreview(cycle.image_url || '');
    setShowCycleForm(true);
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
    if (!cycleForm.name || !cycleForm.location || !cycleForm.price_per_hour) {
      toast.error('Please fill all required fields'); return;
    }
    setFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(cycleForm).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      // IMPORTANT: Do NOT set Content-Type manually for FormData.
      // Axios + browser must set it automatically so the multipart boundary is included.
      if (editingCycle) {
        await api.put(`/cycles/${editingCycle.id}`, fd);
        toast.success('Cycle updated! ✅');
      } else {
        await api.post('/cycles', fd);
        toast.success('Cycle added! 🚲');
      }
      refetchCycles();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cycle');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deletePopup.cycle) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/cycles/${deletePopup.cycle.id}`);
      toast.success('Cycle deleted');
      refetchCycles();
      setDeletePopup({ open: false, cycle: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setDeleteLoading(false); }
  };

  // ── Derived stats ──
  const totalRevenue = bookings?.filter(b => b.status === 'completed')
    .reduce((s, b) => s + parseFloat(b.total_cost || 0), 0) || 0;
  const activeBookings = bookings?.filter(b => ['active', 'booked'].includes(b.status)).length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const availableCycles = cycles?.filter(c => c.status === 'available').length || 0;

  // ── Filtered lists ──
  const filteredCycles = cycles?.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const filteredBookings = bookings?.filter(b => {
    const matchFilter = !bookingFilter || b.status === bookingFilter;
    return matchFilter;
  }) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'cycles', label: 'Cycles', icon: Bike },
    { id: 'bookings', label: 'Bookings', icon: Package },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            Admin Panel
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage cycles, bookings, and platform stats
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', fontFamily: 'Space Grotesk' }}>
          🔑 Administrator
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all"
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

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Cycles', value: stats?.totalCycles ?? cycles?.length ?? 0, icon: Bike, color: 'var(--accent)', bg: 'rgba(34,197,94,0.1)' },
              { label: 'Available', value: stats?.availableCycles ?? availableCycles, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Active Bookings', value: stats?.activeBookings ?? activeBookings, icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? totalRevenue).toFixed(0)}`, icon: BarChart2, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
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

          {/* Booking breakdown */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Booking Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Active', value: stats?.activeBookings ?? activeBookings, color: '#22c55e' },
                { label: 'Pending', value: stats?.pendingBookings ?? pendingBookings, color: '#f59e0b' },
                { label: 'Completed', value: stats?.completedBookings ?? completedBookings, color: '#6b7280' },
                { label: 'Cancelled', value: stats?.cancelledBookings ?? (bookings?.filter(b => b.status === 'cancelled').length || 0), color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Users stat */}
          {stats?.totalUsers !== undefined && (
            <div className="rounded-2xl p-4 mt-4 flex items-center gap-4"
              style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
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

      {/* ── CYCLES ── */}
      {activeTab === 'cycles' && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex gap-2 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-40">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input-field pl-8 text-sm" placeholder="Search cycles…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input-field w-auto px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'Space Grotesk' }}>
              <Plus size={14} /> Add Cycle
            </button>
          </div>

          {cyclesLoading ? <Loader /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCycles.map(cycle => (
                <div key={cycle.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                    {cycle.image_url ? (
                      <img src={cycle.image_url} alt={cycle.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {typeEmoji[cycle.cycle_type] || '🚲'}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{
                        background: statusColors[cycle.status]?.bg || 'rgba(107,114,128,0.1)',
                        color: statusColors[cycle.status]?.color || '#6b7280',
                      }}>
                      {statusColors[cycle.status]?.label || cycle.status}
                    </div>
                  </div>

                  {/* Info */}
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

      {/* ── BOOKINGS ── */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
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

          {bookingsLoading ? <Loader /> : (
            <div className="space-y-3">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-input)' }}>
                    {typeEmoji[booking.cycle?.cycle_type] || '🚲'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                        {booking.user?.name || `User #${booking.user_id}`}
                      </p>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{
                          background: bookingColors[booking.status]?.bg || 'rgba(107,114,128,0.1)',
                          color: bookingColors[booking.status]?.color || '#6b7280',
                        }}>
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
              {!filteredBookings.length && (
                <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold" style={{ fontFamily: 'Space Grotesk' }}>No bookings found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === 'history' && (
        <div>
          <div className="rounded-2xl p-4 mb-4 grid grid-cols-3 gap-4"
            style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            {[
              { label: 'Total Bookings', value: bookings?.length || 0, color: 'var(--accent)' },
              { label: 'Completed', value: completedBookings, color: '#22c55e' },
              { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: '#8b5cf6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {bookingsLoading ? <Loader /> : (
            <div className="space-y-3">
              {(bookings || []).map(booking => (
                <div key={booking.id} className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--bg-input)' }}>
                    {typeEmoji[booking.cycle?.cycle_type] || '🚲'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
                      {booking.user?.name || `User #${booking.user_id}`} — {booking.cycle?.name || `Cycle #${booking.cycle_id}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(booking.start_time || booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      {booking.end_time && ` → ${new Date(booking.end_time).toLocaleString('en-IN', { timeStyle: 'short' })}`}
                    </p>
                    {booking.pickup_location && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {booking.pickup_location} → {booking.drop_location || '—'}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{
                        background: bookingColors[booking.status]?.bg || 'rgba(107,114,128,0.1)',
                        color: bookingColors[booking.status]?.color || '#6b7280',
                      }}>
                      {booking.status}
                    </span>
                    {booking.total_cost && (
                      <p className="font-extrabold text-sm mt-1" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
                        ₹{parseFloat(booking.total_cost).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD/EDIT CYCLE FORM POPUP ── */}
      <Popup open={showCycleForm} onClose={closeForm} title={editingCycle ? 'Edit Cycle' : 'Add New Cycle'} variant="form">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              Cycle Image
            </label>
            <div
              className="relative h-36 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
              style={{ background: 'var(--bg-input)', border: '1.5px dashed var(--border)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <Upload size={16} /> Change Image
                    </div>
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
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                Name *
              </label>
              <input className="input-field text-sm" value={cycleForm.name}
                onChange={e => setCycleForm(p => ({ ...p, name: e.target.value }))} placeholder="Cycle name" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                Type
              </label>
              <select className="input-field text-sm" value={cycleForm.cycle_type}
                onChange={e => setCycleForm(p => ({ ...p, cycle_type: e.target.value }))}
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="standard">🚲 Standard</option>
                <option value="electric">⚡ Electric</option>
                <option value="mountain">🏔️ Mountain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                Location *
              </label>
              <input className="input-field text-sm" value={cycleForm.location}
                onChange={e => setCycleForm(p => ({ ...p, location: e.target.value }))} placeholder="Station location" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
                Price/hr (₹) *
              </label>
              <input className="input-field text-sm" type="number" value={cycleForm.price_per_hour}
                onChange={e => setCycleForm(p => ({ ...p, price_per_hour: e.target.value }))} placeholder="e.g. 30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              Status
            </label>
            <select className="input-field text-sm" value={cycleForm.status}
              onChange={e => setCycleForm(p => ({ ...p, status: e.target.value }))}
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              Description
            </label>
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

      {/* Delete confirm popup */}
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

      {/* View booking popup */}
      <Popup
        open={viewBookingPopup.open}
        onClose={() => setViewBookingPopup({ open: false, booking: null })}
        title="Booking Details"
        variant="form"
      >
        {viewBookingPopup.booking && (
          <div className="space-y-3 text-sm">
            {[
              ['Booking ID', `#${viewBookingPopup.booking.id}`],
              ['User', viewBookingPopup.booking.user?.name || `#${viewBookingPopup.booking.user_id}`],
              ['Cycle', viewBookingPopup.booking.cycle?.name || `#${viewBookingPopup.booking.cycle_id}`],
              ['Status', viewBookingPopup.booking.status],
              ['Pickup', viewBookingPopup.booking.pickup_location || '—'],
              ['Drop', viewBookingPopup.booking.drop_location || '—'],
              ['Start', viewBookingPopup.booking.start_time ? new Date(viewBookingPopup.booking.start_time).toLocaleString('en-IN') : '—'],
              ['End', viewBookingPopup.booking.end_time ? new Date(viewBookingPopup.booking.end_time).toLocaleString('en-IN') : 'Ongoing'],
              ['Duration', viewBookingPopup.booking.duration_hours ? `${parseFloat(viewBookingPopup.booking.duration_hours).toFixed(2)} hrs` : '—'],
              ['Total Cost', viewBookingPopup.booking.total_cost ? `₹${parseFloat(viewBookingPopup.booking.total_cost).toFixed(2)}` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{k}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewBookingPopup({ open: false, booking: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
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
