import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, Sun, Moon, ArrowRight, Leaf, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const validate = (form) => {
  const errs = {};
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
  return errs;
};

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await loginService(form);
      const userData = res.data.data.user;
      login(userData, res.data.data.token);
      toast.success('Welcome back! 🚲');
      userData.role === 'admin' ? navigate('/admin') : navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-center p-12 overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
            <Bike size={36} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-white mb-6" style={{ fontFamily: 'Space Grotesk' }}>
            Ride the <br /> Future Today.
          </h1>
          <div className="space-y-4">
            {['100% Zero Emissions', 'Instant Smart Booking', 'AI Powered Routes'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-white font-semibold">
                <CheckCircle2 size={20} className="text-emerald-300" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <button onClick={toggle}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>Sign In</h2>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field - Fixed Overlap */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center justify-center z-10 pointer-events-none">
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <input 
                  name="email" type="email" value={form.email} onChange={onChange}
                  placeholder="name@company.com" 
                  className={`input-field w-full rounded-xl transition-all ${errors.email ? 'border-red-500' : ''}`}
                  style={{ 
                    paddingLeft: '44px', // Guaranteed clear space for icon
                    height: '48px', 
                    background: 'var(--bg-input)', 
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field - Fixed Overlap */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center justify-center z-10 pointer-events-none">
                  <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
                <input 
                  name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={onChange}
                  placeholder="••••••••" 
                  className={`input-field w-full rounded-xl transition-all ${errors.password ? 'border-red-500' : ''}`}
                  style={{ 
                    paddingLeft: '44px', // Guaranteed clear space for icon
                    paddingRight: '44px', // Space for Eye icon
                    height: '48px', 
                    background: 'var(--bg-input)', 
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.password}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-accent)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              New to EcoCycle? <Link to="/register" className="font-black" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>Create Account</Link>
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed" 
               style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'var(--border)' }}>
            <Leaf size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Sustainable Urban Mobility</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;