import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCycles } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import CycleList from '../components/cycle/CycleList';
import { Search, MapPin, Zap, Bike, TrendingUp, Leaf } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();
  const { data: cycles, loading } = useFetch(() => getAllCycles({ status: statusFilter }), [statusFilter]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const filtered = cycles?.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || c.cycle_type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = [
    { label: 'Available', value: cycles?.filter(c => c.status === 'available').length ?? 0, icon: Bike, color: 'var(--accent)', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Stations', value: new Set(cycles?.map(c => c.location)).size ?? 0, icon: MapPin, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Electric', value: cycles?.filter(c => c.cycle_type === 'electric').length ?? 0, icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            {greeting},{' '}
            <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Find and rent eco-friendly cycles near you
          </p>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="btn-secondary items-center gap-2 text-sm hidden sm:flex"
        >
          <MapPin size={14} /> Live Map
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
              {loading ? '—' : value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* AI hint banner */}
      <div
        className="rounded-xl p-3 mb-5 flex items-center gap-3 cursor-pointer transition-all"
        style={{ background: 'var(--accent-light)', border: '1.5px solid var(--border-strong)' }}
        onClick={() => navigate('/ai-insights')}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}>
          <TrendingUp size={16} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ fontFamily: 'Space Grotesk', color: 'var(--accent)' }}>
            AI Smart Suggestions Available
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Best time to ride, dynamic pricing & recommendations →
          </p>
        </div>
        <Leaf size={16} style={{ color: 'var(--accent)', shrink: 0 }} />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center">
        {/* Search Bar with Overlap Fix */}
        <div className="relative w-full flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <input
            type="text"
            className="input-field w-full text-sm"
            placeholder="Search cycles or locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              paddingLeft: '2.75rem', // Added extra padding to clear the icon
              height: '42px',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="input-field px-3 text-sm cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ 
              background: 'var(--bg-input)', 
              color: 'var(--text-primary)', 
              height: '42px',
              minWidth: '120px' 
            }}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>

          <select
            className="input-field px-3 text-sm cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ 
              background: 'var(--bg-input)', 
              color: 'var(--text-primary)', 
              height: '42px',
              minWidth: '120px' 
            }}
          >
            <option value="">All Types</option>
            <option value="electric">⚡ Electric</option>
            <option value="mountain">🏔️ Mountain</option>
            <option value="standard">🚲 Standard</option>
          </select>
        </div>
      </div>

      {/* Cycle list */}
      <div>
        <h2 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>
          Nearby Cycles {filtered ? `(${filtered.length})` : ''}
        </h2>
        <CycleList cycles={filtered} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;