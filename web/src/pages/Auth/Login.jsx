import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/comman/Input';
import Button from '../../components/comman/Button';
import toast from 'react-hot-toast';
import { Bike } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('All fields required'); return; }
    setLoading(true);
    try {
      const res = await loginService(form);
      login(res.data.data.user, res.data.data.token);
      toast.success('Welcome back! 🚲');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Bike size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CycleRent AI</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to start riding</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">Demo: admin@cyclerent.com / admin123</p>
        </div>
      </div>
    </div>
  );
};
export default Login;
