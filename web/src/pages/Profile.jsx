import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth.service';
import Input from '../components/comman/Input';
import Button from '../components/comman/Button';
import toast from 'react-hot-toast';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(form);
      login(res.data.data, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 flex items-center"><Mail size={12} className="mr-1" />{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{user?.role}</span>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
          <Button className="w-full" onClick={handleUpdate} loading={loading}>Update Profile</Button>
        </div>
      </div>
      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} className="mr-2" /> Logout
      </Button>
    </div>
  );
};
export default Profile;
