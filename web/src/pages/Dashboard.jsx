import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCycles } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import CycleList from '../components/cycle/CycleList';
import { Search, MapPin, Zap, Bike, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const navigate = useNavigate();
  const { data: cycles, loading } = useFetch(() => getAllCycles({ status: statusFilter }), [statusFilter]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const filtered = cycles?.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Available', value: cycles?.filter(c => c.status === 'available').length ?? 0, icon: Bike, color: 'var(--accent)' },
    { label: 'Stations', value: new Set(cycles?.map(c => c.location)).size ?? 0, icon: MapPin, color: '#10b981' },
    { label: 'Electric', value: cycles?.filter(c => c.cycle_type === 'electric').length ?? 0, icon: Zap, color: '#f59e0b' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            {greeting}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Find and rent cycles near you</p>
        </div>
        <button onClick={() => navigate('/map')}
          className="btn-secondary flex items-center gap-2 text-sm hidden sm:flex">
          <MapPin size={14} /> View Map
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}15` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{loading ? '—' : value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* AI hint */}
      <div className="rounded-xl p-3 mb-5 flex items-center gap-3 cursor-pointer" style={{ background: 'var(--accent-light)', border: '1px solid var(--border-strong)' }} onClick={() => navigate('/ai-insights')}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}>
          <TrendingUp size={14} color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ fontFamily: 'Syne', color: 'var(--accent)' }}>AI Insights Available</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Check smart pricing & best times to rent →</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search cycles or locations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
      </div>

      {/* Cycle list */}
      <div>
        <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ fontFamily: 'Syne', color: 'var(--text-muted)' }}>
          Nearby Cycles {filtered ? `(${filtered.length})` : ''}
        </h2>
        <CycleList cycles={filtered} loading={loading} />
      </div>
    </div>
  );
};
export default Dashboard;
