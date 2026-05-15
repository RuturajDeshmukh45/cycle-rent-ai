import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import { useState, useEffect } from 'react';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import CycleDetails from './pages/CycleDetails';
import Booking from './pages/Booking';
import MyRides from './pages/MyRides';
import History from './pages/History';
import Profile from './pages/Profile';
import MapView from './pages/MapView';
import AIInsights from './pages/AIInsights';
import AdminPanel from './pages/Admin/AdminPanel';

// FIX 1: AppLayout wires hamburger → sidebar open state
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile nav)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar onMenuClick={() => setSidebarOpen(p => !p)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

// FIX 2: AdminRoute — robust check with fallback to localStorage user
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Double-check: read directly from localStorage in case state is stale
  let adminConfirmed = isAdmin;
  if (!adminConfirmed) {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      adminConfirmed = stored?.role === 'admin';
    } catch { adminConfirmed = false; }
  }
  if (!adminConfirmed) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 500,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cycles/:id" element={<CycleDetails />} />
            <Route path="booking/:cycleId" element={<Booking />} />
            <Route path="my-rides" element={<MyRides />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="map" element={<MapView />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;