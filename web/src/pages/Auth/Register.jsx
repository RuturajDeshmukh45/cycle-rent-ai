import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/comman/Input';
import Button from '../../components/comman/Button';
import toast from 'react-hot-toast';
import { Bike } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerService(form);
      login(res.data.data.user, res.data.data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Bike size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join CycleRent AI today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
          <Input label="Phone (optional)" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Create Account</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
