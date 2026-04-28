import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bike, LogOut, User, BarChart2, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <Bike size={28} />
            <span>CycleRent AI</span>
          </Link>
          <div className="flex items-center space-x-1">
            <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
              <Home size={16} className="mr-1" /> Home
            </Link>
            <Link to="/my-rides" className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
              <Bike size={16} className="mr-1" /> My Rides
            </Link>
            <Link to="/ai-insights" className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
              <BarChart2 size={16} className="mr-1" /> AI Insights
            </Link>
            <Link to="/profile" className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
              <User size={16} className="mr-1" /> {user?.name?.split(' ')[0]}
            </Link>
            <button onClick={handleLogout} className="flex items-center px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
              <LogOut size={16} className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
