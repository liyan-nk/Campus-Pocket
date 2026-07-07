import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await loginAdmin(username.trim(), password);
      navigate('/cp-control/dashboard'); // Phase 3 dashboard placeholder
    } catch (err) {
      setError(err.message || 'Access Denied. Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-100 tracking-tight">
            Control Console
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Authorized Personnel Only
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-sm text-red-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter administrator username"
              className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-display font-semibold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Access Console</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 font-medium pt-2">
          Strict monitoring is active. Unauthorized access attempts will be logged.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
