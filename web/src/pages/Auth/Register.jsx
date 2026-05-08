import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, User, Phone, Sun, Moon, ArrowRight } from 'lucide-react';

const validate = (form) => {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Full name is required';
  else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
  if (!form.confirmPassword) errs.confirmPassword = 'Please confirm password';
  else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
};

const Field = ({ label, icon: Icon, error, ...rest }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>{label}</label>
    <div className="relative">
      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input className={`input-field pl-9 ${error ? 'error' : ''}`} {...rest} />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {error}</p>}
  </div>
);

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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
      const res = await registerService({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.data.user, res.data.data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'var(--accent)' }} />
      <div className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'var(--accent-dark)' }} />

      <button onClick={toggle} className="absolute top-5 right-5 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', boxShadow: 'var(--shadow-accent)' }}>
            <Bike size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>Create Account</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Start your sustainable journey today</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Field label="Full Name" icon={User} name="name" type="text" value={form.name} onChange={onChange} placeholder="Your full name" error={errors.name} autoComplete="name" />
            <Field label="Email" icon={Mail} name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" error={errors.email} autoComplete="email" />
            <Field label="Phone (optional)" icon={Phone} name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+91 9876543210" error={errors.phone} />
            <Field label="Password" icon={Lock} name="password" type="password" value={form.password} onChange={onChange} placeholder="Min. 6 characters" error={errors.password} autoComplete="new-password" />
            <Field label="Confirm Password" icon={Lock} name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} placeholder="Repeat password" error={errors.confirmPassword} autoComplete="new-password" />

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1 py-3 text-sm">
              {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />Creating...</> : <><ArrowRight size={15} />Create Account</>}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
