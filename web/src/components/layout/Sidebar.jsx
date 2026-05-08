import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Bike, Clock, Brain, User, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: MapPin, label: 'Map View' },
  { to: '/my-rides', icon: Bike, label: 'My Rides' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { isAdmin } = useAuth();
  return (
    <aside className="w-56 shrink-0 border-r min-h-full py-5 hidden md:block" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <nav className="px-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
              ? 'bg-sky-400/10 font-semibold'
              : 'hover:bg-[var(--bg-input)]'}`
          } style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
            fontFamily: 'Syne',
          })}>
            {({ isActive }) => (
              <>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-sky-400/15' : ''}`}>
                  <Icon size={15} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/analytics" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 ${isActive ? 'bg-purple-400/10' : 'hover:bg-[var(--bg-input)]'}`
          } style={({ isActive }) => ({ color: isActive ? '#a78bfa' : 'var(--text-secondary)', fontFamily: 'Syne' })}>
            {() => (
              <><div className="w-7 h-7 rounded-lg flex items-center justify-center"><BarChart2 size={15} /></div>Analytics</>
            )}
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
export default Sidebar;
