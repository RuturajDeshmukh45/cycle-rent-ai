import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Bike, Clock, Brain, Leaf, ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Profile link removed here since it is handled by the Navbar profile dropdown
const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: MapPin, label: 'Map View' },
  { to: '/my-rides', icon: Bike, label: 'My Rides' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/ai-insights', icon: Brain, label: 'AI Insights' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const content = (
    <>
      {/* Eco tag + close button row */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}
        >
          <Leaf size={13} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
            Eco-Friendly Rides
          </span>
        </div>
        {/* Close button — visible only when sidebar is opened as overlay */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 md:hidden"
            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <nav className="px-3 space-y-0.5 flex-1">
        {/* If user is NOT admin, show normal app navigation tabs */}
        {!isAdmin ? (
          links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? '' : 'hover:bg-[var(--bg-input)]'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                fontFamily: 'Space Grotesk',
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'inherit',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  {label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  )}
                </>
              )}
            </NavLink>
          ))
        ) : (
          /* If user IS admin, show only Admin Panel (Single entry point) */
          <>
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Admin Area</p>
            </div>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? '' : 'hover:bg-[var(--bg-input)]'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#8b5cf6' : 'var(--text-secondary)',
                background: isActive ? 'rgba(139,92,246,0.08)' : 'transparent',
                fontFamily: 'Space Grotesk',
              })}
            >
              {({ isActive }) => (
                <>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent', color: isActive ? '#8b5cf6' : 'inherit' }}>
                    <ShieldCheck size={15} />
                  </div>
                  Admin Panel
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />}
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      <div className="px-4 pt-4" style={{ borderTop: '1px solid var(--border)', marginTop: '12px' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
          🌱 Saving CO₂ every ride
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside
        className="w-56 shrink-0 h-[calc(100vh-60px)] fixed top-[60px] left-0 py-5 hidden md:flex flex-col z-30"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {content}
      </aside>

      {/* Invisible flex-spacer to occupy layout grid slot left behind by fixed positioning */}
      <div className="w-56 shrink-0 hidden md:block" aria-hidden="true" />

      {/* Mobile overlay sidebar layout */}
      {isOpen && (
        <>
          {/* Backdrop layer */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />
          {/* Drawer container layer */}
          <aside
            className="fixed top-0 left-0 h-full z-50 py-5 flex flex-col md:hidden"
            style={{
              width: '240px',
              background: 'var(--sidebar-bg)',
              borderRight: '1px solid var(--border)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              animation: 'slideInLeft .2s ease',
            }}
          >
            {content}
          </aside>
        </>
      )}

      <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
    </>
  );
};

export default Sidebar;