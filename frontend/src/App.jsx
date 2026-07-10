import React from 'react';
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
      </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
