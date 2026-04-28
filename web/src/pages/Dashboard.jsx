import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCycles } from '../services/cycle.service';
import useFetch from '../hooks/useFetch';
import CycleList from '../components/cycle/CycleList';
import Input from '../components/comman/Input';
import Button from '../components/comman/Button';
import { MapPin, Bike, Zap, Search } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const navigate = useNavigate();
  const { data: cycles, loading, refetch } = useFetch(() => getAllCycles({ status: statusFilter }), [statusFilter]);

  const filtered = cycles?.filter(c =>
    !filter || c.name.toLowerCase().includes(filter.toLowerCase()) || c.location.toLowerCase().includes(filter.toLowerCase())
  );

  const stats = [
    { label: 'Available Cycles', value: cycles?.filter(c => c.status === 'available').length || 0, icon: '🚲', color: 'blue' },
    { label: 'Total Stations', value: new Set(cycles?.map(c => c.location)).size || 0, icon: '📍', color: 'green' },
    { label: 'Electric Cycles', value: cycles?.filter(c => c.cycle_type === 'electric').length || 0, icon: '⚡', color: 'yellow' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Find and rent cycles near you</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search cycles or locations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Cycles</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => navigate('/map')} className="flex items-center">
          <MapPin size={16} className="mr-1" /> Map
        </Button>
      </div>

      {/* Cycle list */}
      <CycleList cycles={filtered} loading={loading} />
    </div>
  );
};
export default Dashboard;
