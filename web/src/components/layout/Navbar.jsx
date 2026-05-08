import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bike, Bell, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-5 h-15 flex items-center justify-between" style={{ height: '60px' }}>
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }}>
            <Bike size={16} color="#fff" />
          </div>
          <span className="text-base font-extrabold tracking-tight" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
            Cycle<span style={{ color: 'var(--accent)' }}>Rent</span>
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}
            title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-semibold hidden sm:block" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
            style={{ color: 'var(--danger)' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
