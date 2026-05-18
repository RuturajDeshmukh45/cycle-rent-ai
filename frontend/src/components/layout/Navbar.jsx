import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bike, LogOut, Bell, Menu, ShieldCheck, Palette, X, RotateCcw, Check, TrendingUp, Trash } from 'lucide-react';
import Popup from '../comman/Popup';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const { dark, setDark, customColors, updateCustomColor, resetTheme, saveThemeToDB } = useTheme();

  if (!isOpen) return null;

  const colorFields = [
    { label: 'Accent Color', key: '--accent' },
    { label: 'Main Background', key: '--bg-primary' },
    { label: 'Container / Card', key: '--bg-card' },
    { label: 'Input Fields', key: '--bg-input' },
    { label: 'Primary Text', key: '--text-primary' },
    { label: 'Border Lines', key: '--border' },
  ];

  const handleFinalSave = async () => {
    await saveThemeToDB();
    toast.success("Theme settings synced!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-[2.5rem] p-8 border shadow-2xl my-auto" 
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold flex items-center gap-2 text-base uppercase tracking-widest" 
              style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
            <Palette size={20} className="text-violet-500" /> Theme Customizer
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: 'var(--bg-input)' }}>
            <button onClick={() => setDark(false)} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${!dark ? 'bg-white shadow-md text-black' : 'opacity-50 text-[var(--text-primary)]'}`}><Sun size={14} /> Light</button>
            <button onClick={() => setDark(true)} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${dark ? 'bg-zinc-800 shadow-md text-white' : 'opacity-50 text-[var(--text-primary)]'}`}><Moon size={14} /> Dark</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colorFields.map((field) => (
              <div key={field.key}>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 opacity-60" style={{ color: 'var(--text-primary)' }}>
                  {field.label}
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <input 
                    type="color" 
                    value={customColors[field.key] || getComputedStyle(document.documentElement).getPropertyValue(field.key).trim() || '#ffffff'} 
                    onChange={(e) => updateCustomColor(field.key, e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
                  />
                  <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--text-primary)' }}>
                    {customColors[field.key] || 'Auto'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button onClick={resetTheme} className="w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <RotateCcw size={18} />
            </button>
            <button onClick={handleFinalSave} className="flex-1 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg" style={{ background: 'var(--accent)' }}>
              <Check size={18} /> Apply & Save Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationPanel = ({ notifications, onApprove, onReject, onDelete, onClearAll, onClose }) => {
  return (
    <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Notifications</p>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll} 
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={24} className="mx-auto opacity-20 mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs text-muted-foreground">No new alerts</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-4 border-b last:border-0 relative group" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-2 pr-6">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>
                    {n.title || n.message}
                  </p>
                  {n.title && n.message && (
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  )}
                </div>
                {n.type === 'price_request' && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => onReject && onReject(n)}
                      className="flex-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-transform active:scale-95"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(n)}
                      className="flex-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm transition-transform active:scale-95"
                      style={{ background: 'var(--accent)' }}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[9px] mt-2 opacity-40 uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
              
              <button
                onClick={() => onDelete(n.id)}
                className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 text-red-500"
              >
                <Trash size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const updateNotifs = () => {
    const localNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    
    if (localNotifs.length === 0 && !localStorage.getItem('notifs_initialized')) {
      const defaultNotifs = [
        { id: 101, message: 'New booking created by Dhananjay', time: '2 min ago', read: false },
        { id: 102, message: 'Booking #5 cancelled by user',     time: '10 min ago', read: false },
        { id: 103, message: 'Cycle "super x" marked as maintenance', time: '1 hr ago', read: false },
      ];
      localStorage.setItem('admin_notifications', JSON.stringify(defaultNotifs));
      localStorage.setItem('notifs_initialized', 'true');
      setNotifications(defaultNotifs);
    } else {
      setNotifications(localNotifs);
    }
  };

  useEffect(() => {
    updateNotifs();
    window.addEventListener('storage', updateNotifs);
    const interval = setInterval(updateNotifs, 5000);
    return () => {
      window.removeEventListener('storage', updateNotifs);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => { 
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleApprovePrice = (notif) => {
    toast.success(`AI Pricing Approved: ₹${notif.suggestedPrice}/hr`);
    if (notif.proposalData) {
      localStorage.setItem('ai_price_approved', JSON.stringify(notif.proposalData));
    }
    const updated = notifications.filter(item => item.id !== notif.id);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    setNotifications(updated);
    setShowNotifications(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleRejectPrice = (notif) => {
    toast('Price update rejected.', { icon: '❌' });
    const updated = notifications.filter(item => item.id !== notif.id);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    setNotifications(updated);
    setShowNotifications(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteNotification = (id) => {
    const updated = notifications.filter(item => item.id !== id);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new Event('storage'));
  };

  const handleClearAllNotifications = () => {
    localStorage.setItem('admin_notifications', JSON.stringify([]));
    setNotifications([]);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between" style={{ height: '60px' }}>
          <div className="flex items-center gap-2">
            <button onClick={onMenuClick} className="w-9 h-9 rounded-xl flex items-center justify-center md:hidden border" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              <Menu size={16} />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                <Bike size={18} color="#fff" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold hidden sm:block" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>EcoCycle</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Notification Bell */}
            {isAdmin && (
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all relative" 
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-white animate-bounce" 
                          style={{ background: 'var(--accent)' }}>
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel 
                    notifications={notifications} 
                    onApprove={handleApprovePrice}
                    onReject={handleRejectPrice}
                    onDelete={handleDeleteNotification}
                    onClearAll={handleClearAllNotifications}
                    onClose={() => setShowNotifications(false)} 
                  />
                )}
              </div>
            )}

            {/* User Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }} onClick={() => setShowMenu(!showMenu)}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                  {user?.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold hidden sm:block truncate max-w-[80px]" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{user?.name?.split(' ')[0]}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <button onClick={() => { navigate('/profile'); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold hover:bg-[var(--bg-input)]" style={{ color: 'var(--text-primary)' }}>
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 text-xs">{user?.name?.[0]}</div>
                    <div className="text-left"><p className="truncate font-bold">{user?.name}</p><p className="text-[9px] opacity-60 uppercase">My Profile</p></div>
                  </button>
                  
                  <div className="h-[1px] mx-4 bg-[var(--border)] opacity-50" />
                  
                  <button onClick={() => { setShowCustomizer(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold hover:bg-[var(--bg-input)]" style={{ color: 'var(--text-primary)' }}>
                    <Palette size={15} className="text-violet-500" /> Customize Theme
                  </button>
                  
                  {isAdmin && (
                    <button onClick={() => { navigate('/admin'); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold hover:bg-[var(--bg-input)]" style={{ color: 'var(--text-primary)' }}>
                      <ShieldCheck size={15} className="text-blue-500" /> Admin Dashboard
                    </button>
                  )}

                  <div className="h-[1px] mx-4 bg-[var(--border)] opacity-50" />
                  
                  <button onClick={() => { setLogoutPopup(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-4 text-xs font-bold text-red-500 hover:bg-red-50">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ThemeCustomizer isOpen={showCustomizer} onClose={() => setShowCustomizer(false)} />
      
      <Popup
        open={logoutPopup}
        onClose={() => setLogoutPopup(false)}
        onConfirm={() => { logout(); navigate('/login'); }}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Yes, Sign Out"
        cancelText="Stay"
        variant="danger"
      />
    </>
  );
};

export default Navbar;