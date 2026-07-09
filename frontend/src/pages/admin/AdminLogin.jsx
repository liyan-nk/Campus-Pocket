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
    <div className="min-h-screen bg-cp-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cp-surface rounded-3xl shadow-2xl overflow-hidden border border-cp-border p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-cp-accent-light/10 border border-cp-border rounded-2xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-cp-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cp-text-primary tracking-tight">
            Control Console
          </h1>
          <p className="text-sm text-cp-text-secondary font-medium">
            Authorized Personnel Only
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-sm text-red-500">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter administrator username"
              className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all text-sm"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-4 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-display font-semibold rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-cp-text-on-accent border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Access Console</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-cp-text-secondary font-medium pt-2">
          Strict monitoring is active. Unauthorized access attempts will be logged.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
