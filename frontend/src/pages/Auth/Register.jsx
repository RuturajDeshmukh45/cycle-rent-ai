import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, User, Phone, Sun, Moon, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';

const validate = (form) => {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Full name is required';
  else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6) errs.password = 'At least 6 characters';
  if (!form.confirmPassword) errs.confirmPassword = 'Please confirm password';
  else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
};

// FIXED: Added absolute pixel tracking alignment and manual paddingLeft offsets to eliminate placeholder overlap
const Field = ({ label, icon: Icon, error, isPassword, ...rest }) => {
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? 'text' : 'password') : (rest.type || 'text');
  const { type, ...inputRest } = rest;

  return (
    <div className="w-full flex flex-col">
      <label
        className="block text-xs font-bold mb-1.5 uppercase tracking-wider select-none"
        style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}
      >
        {label}
      </label>
      <div className="relative w-full flex items-center">
        {/* Absolute Centered Left Icon Wrapper */}
        <div className="absolute left-3 pointer-events-none z-10 flex items-center justify-center top-1/2 -translate-y-1/2">
          <Icon
            size={14}
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
        
        <input
          type={inputType}
          className={`input-field w-full ${error ? 'error' : ''}`}
          style={{ 
            boxSizing: 'border-box',
            paddingLeft: '2.5rem', // FIXED: Forces the placeholder text to stay completely clear of the left icon
            paddingRight: isPassword ? '2.5rem' : '1rem' // FIXED: Keeps text clear of the password visibility icon on the right
          }}
          {...inputRest}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            className="absolute right-3 z-10 flex items-center justify-center top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            tabIndex={-1}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium flex items-center gap-1 shrink-0" style={{ color: 'var(--danger)' }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await registerService({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(res.data.data.user, res.data.data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto"
      style={{ background: 'var(--bg-primary)', boxSizing: 'border-box' }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-0 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-12 pointer-events-none"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-8 pointer-events-none"
        style={{ background: 'var(--accent-dark)' }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center z-20"
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-sm relative z-10 my-auto flex flex-col gap-5">
        {/* Logo Header */}
        <div className="text-center flex flex-col items-center">
          <div
            className="flex w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: 'var(--shadow-accent)' }}
          >
            <Bike size={30} color="#fff" strokeWidth={2.5} />
          </div>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}
          >
            Create Account
          </h1>
          <p className="text-sm flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <Leaf size={13} style={{ color: 'var(--accent)' }} /> Start your sustainable journey today
          </p>
        </div>

        {/* Form Box Wrapper */}
        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Field
              label="Full Name"
              icon={User}
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              placeholder="Your full name"
              error={errors.name}
              autoComplete="name"
            />
            <Field
              label="Email"
              icon={Mail}
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              error={errors.email}
              autoComplete="email"
            />
            <Field
              label="Phone (optional)"
              icon={Phone}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={onChange}
              placeholder="+91 9876543210"
              error={errors.phone}
            />
            <Field
              label="Password"
              icon={Lock}
              name="password"
              isPassword
              value={form.password}
              onChange={onChange}
              placeholder="Min 6 characters"
              error={errors.password}
              autoComplete="new-password"
            />
            <Field
              label="Confirm Password"
              icon={Lock}
              name="confirmPassword"
              isPassword
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-sm flex items-center justify-center gap-2 font-bold">
              {loading ? (
                <>
                  <span className="spinner inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ArrowRight size={15} /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Subtext */}
        <div
          className="rounded-xl p-3 text-center text-xs flex items-center justify-center gap-1.5 select-none shrink-0"
          style={{ background: 'var(--accent-light)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          <Leaf size={11} style={{ color: 'var(--accent)' }} />
          Eco-friendly urban mobility · Zero emissions
        </div>
      </div>
    </div>
  );
};

export default Register;