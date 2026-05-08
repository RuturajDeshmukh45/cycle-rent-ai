import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, Sun, Moon, ArrowRight } from 'lucide-react';

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
      login(res.data.data.user, res.data.data.token);
      toast.success('Welcome back! 🚲');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'var(--accent)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'var(--accent-dark)' }} />

      {/* Theme toggle */}
      <button onClick={toggle} className="absolute top-5 right-5 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', boxShadow: 'var(--shadow-accent)' }}>
            <Bike size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to continue your journey</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com"
                  className={`input-field pl-9 ${errors.email ? 'error' : ''}`} autoComplete="email" />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••"
                  className={`input-field pl-9 ${errors.password ? 'error' : ''}`} autoComplete="current-password" />
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-sm">
              {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />Signing in...</> : <><ArrowRight size={15} />Sign In</>}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>Sign up</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl p-3 text-center text-xs" style={{ background: 'var(--accent-light)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Demo — create an account to test, or set admin via DB
        </div>
      </div>
    </div>
  );
};
export default Login;
