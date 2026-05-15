import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Phone, LogOut, Save, Camera, Loader2 } from 'lucide-react';
import Popup from '../components/comman/Popup';

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
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage || null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [savePopup, setSavePopup] = useState(false);

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image must be less than 2MB");
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSavePopup(true);
  };

  const doUpdate = async () => {
    setLoading(true);
    setSavePopup(false);
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    if (selectedFile) {
      formData.append('image', selectedFile); 
    }

    try {
      const res = await updateProfile(formData);
      const updatedUser = res.data.data;
      
      // FIX: Update AuthContext and LocalStorage so image persists after logout
      const token = localStorage.getItem('token');
      login(updatedUser, token);
      localStorage.setItem('user', JSON.stringify(updatedUser)); 
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto page-enter">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>Profile</h1>

      {/* Avatar card */}
      <div className="rounded-2xl p-6 mb-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:gap-6" 
           style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden bg-zinc-200"
            style={{ 
              background: !previewUrl ? 'linear-gradient(135deg,var(--accent),var(--accent-dark))' : 'var(--bg-input)', 
              boxShadow: 'var(--shadow-accent)', 
              fontFamily: 'Space Grotesk' 
            }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} color="#fff" />
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div>
          <h2 className="font-extrabold text-xl" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{user?.name}</h2>
          <p className="text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={14} /> {user?.email}
          </p>
          <div className="mt-2.5">
            <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" 
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-6" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>Edit Details</h3>
        <div className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Full Name</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <User size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                placeholder="Your full name" 
                className={`input-field w-full text-sm ${errors.name ? 'error' : ''}`} 
                style={{ paddingLeft: '2.75rem', height: '45px' }}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Phone</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={onChange} 
                placeholder="+91 9876543210" 
                className={`input-field w-full text-sm ${errors.phone ? 'error' : ''}`} 
                style={{ paddingLeft: '2.75rem', height: '45px' }}
              />
            </div>
            {errors.phone && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>Email</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input 
                value={user?.email} 
                disabled 
                className="input-field w-full text-sm opacity-60 cursor-not-allowed" 
                style={{ paddingLeft: '2.75rem', height: '45px' }}
              />
            </div>
            <p className="mt-2 text-[10px] font-medium italic" style={{ color: 'var(--text-muted)' }}>* Email cannot be changed.</p>
          </div>

          <button className="btn-primary w-full py-3 mt-2 font-bold text-sm flex items-center justify-center gap-2" onClick={handleUpdate} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-red-50" 
        style={{ color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
        onClick={() => setLogoutPopup(true)}>
        <LogOut size={16} /> Logout Account
      </button>

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

      <Popup
        open={savePopup}
        onClose={() => setSavePopup(false)}
        onConfirm={doUpdate}
        title="Save Changes"
        message="Update your profile with the new information?"
        confirmText="Save"
        cancelText="Cancel"
        variant="confirm"
        loading={loading}
      />
    </div>
  );
};

export default Profile;