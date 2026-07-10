import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import StudentLayout from './components/Layout/StudentLayout';
import StudentLogin from './pages/student/Login';
import ForcePassword from './pages/student/ForcePassword';
import Dashboard from './pages/student/Dashboard';
import Timetable from './pages/student/Timetable';
import Attendance from './pages/student/Attendance';
import AttendanceHistory from './pages/student/AttendanceHistory';
import Profile from './pages/student/Profile';
import Tasks from './pages/student/Tasks';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';

// Root page redirect helper based on authentication status
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/cp-control/dashboard" replace />;
    }
    if (user.mustChangePassword) {
      return <Navigate to="/force-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <StudentLogin />;
};

// Admin route redirect helper
const AdminRootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  if (user && user.role === 'ADMIN') {
    return <Navigate to="/cp-control/dashboard" replace />;
  }

  return <AdminLogin />;
};

function App() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Find active service worker registration
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return;
        
        const checkUpdate = (r) => {
          if (r.waiting) {
            setSwUpdateAvailable(true);
            setRegistration(r);
            return;
          }
          r.addEventListener('updatefound', () => {
            const newWorker = r.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateAvailable(true);
                  setRegistration(r);
                }
              });
            }
          });
        };

        checkUpdate(reg);
        
        const interval = setInterval(() => {
          reg.update().catch(() => {});
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
      });

      // Controller change listener for instant reload
      let refreshing = false;
      const handleControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }
  }, []);

  const handleUpdateNow = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setSwUpdateAvailable(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Redirect Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/cp-control" element={<AdminRootRedirect />} />

            {/* Student Force Password Route (Standalone) */}
            <Route
              path="/force-password"
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <ForcePassword />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Tabbed Routes (Wrapped in Layout) */}
            <Route
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/history" element={<AttendanceHistory />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/cp-control/dashboard"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Service Worker Update Prompt Toast Banner */}
          {swUpdateAvailable && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-cp-accent text-cp-text-on-accent px-4 py-3 rounded-2xl shadow-xl z-[9999] flex items-center justify-between space-x-3.5 text-xs animate-fadeIn max-w-[280px] w-full border border-cp-border/10">
              <span className="font-semibold leading-tight animate-pulse">Campus Pocket has an update 🚀</span>
              <button 
                onClick={handleUpdateNow}
                className="bg-white text-cp-accent font-bold px-2.5 py-1 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer text-[10px] uppercase tracking-wider"
              >
                Update Now
              </button>
            </div>
          )}
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
