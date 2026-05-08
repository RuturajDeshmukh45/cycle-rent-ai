import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone, LogOut, Save, Shield, Bell } from 'lucide-react';

const validate = (form) => {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Name is required';
  else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
  return errs;
};

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleUpdate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await updateProfile(form);
      login(res.data.data, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-lg mx-auto page-enter">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Profile</h1>

      {/* Avatar card */}
      <div className="rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', boxShadow: 'var(--shadow-accent)', fontFamily: 'Syne' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-extrabold text-lg" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{user?.name}</h2>
          <p className="text-sm flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={12} /> {user?.email}
          </p>
          <span className="badge badge-available mt-1.5" style={{ fontFamily: 'Syne' }}>{user?.role}</span>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ fontFamily: 'Syne', color: 'var(--text-muted)' }}>Edit Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input name="name" value={form.name} onChange={onChange} placeholder="Your full name" className={`input-field pl-9 ${errors.name ? 'error' : ''}`} />
            </div>
            {errors.name && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input name="phone" value={form.phone} onChange={onChange} placeholder="+91 9876543210" className={`input-field pl-9 ${errors.phone ? 'error' : ''}`} />
            </div>
            {errors.phone && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={user?.email} disabled className="input-field pl-9 opacity-50 cursor-not-allowed" />
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
          </div>

          <button className="btn-primary w-full py-2.5 text-sm" onClick={handleUpdate} disabled={loading}>
            {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />Saving...</> : <><Save size={14} />Save Changes</>}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button className="btn-danger w-full py-2.5 text-sm" onClick={() => { logout(); navigate('/login'); }}>
        <LogOut size={14} /> Logout
      </button>
    </div>
  );
};
export default Profile;
