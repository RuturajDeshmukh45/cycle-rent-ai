import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

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

const AppLayout = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontSize: '14px' } }} />
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
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
