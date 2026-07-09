import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert, CheckCircle } from 'lucide-react';

const ForcePassword = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Password change failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cp-bg flex flex-col justify-center py-6 px-4">
      <div className="w-full max-w-md mx-auto bg-cp-surface rounded-3xl shadow-xl overflow-hidden border border-cp-border p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-cp-text-primary tracking-tight">
            Security Update Required
          </h1>
          <p className="text-sm text-cp-text-secondary font-medium">
            You must change your password before continuing.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-3 text-sm text-red-500">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-3 text-sm text-green-500">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
              Current/Temporary Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current or temporary password"
              className="w-full px-4 py-3 bg-cp-bg border border-cp-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all text-sm text-cp-text-primary placeholder-cp-text-secondary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 bg-cp-bg border border-cp-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all text-sm text-cp-text-primary placeholder-cp-text-secondary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 bg-cp-bg border border-cp-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all text-sm text-cp-text-primary placeholder-cp-text-secondary"
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
              <span>Update Password & Continue</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForcePassword;
