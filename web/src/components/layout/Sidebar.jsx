import { NavLink } from 'react-router-dom';
import { Home, Bike, MapPin, History, User, Brain, BarChart2, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/map', icon: MapPin, label: 'Map View' },
  { to: '/my-rides', icon: Bike, label: 'My Rides' },
  { to: '/history', icon: History, label: 'Ride History' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-100">
      <nav className="p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
          }>
            <Icon size={18} /> <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/analytics" className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`
          }>
            <BarChart2 size={18} /> <span>Analytics</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
export default Sidebar;
