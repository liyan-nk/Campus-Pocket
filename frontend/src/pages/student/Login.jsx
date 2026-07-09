import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Sparkles, UserCheck, ShieldAlert } from 'lucide-react';

const StudentLogin = () => {
  const { loginStudent, activateStudent } = useAuth();
  const navigate = useNavigate();

  // Tab state: 'login' or 'activate'
  const [activeTab, setActiveTab] = useState('login');

  // Login form states
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');

  // Activation form states
  const [activationCode, setActivationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status message states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rollNo.trim() || !password) {
      setError('Both Roll Number and Password are required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await loginStudent(rollNo.toUpperCase().trim(), password);
      if (data.mustChangePassword) {
        navigate('/force-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rollNo.trim() || !activationCode.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await activateStudent(rollNo.toUpperCase().trim(), activationCode.trim(), newPassword);
      setSuccess('Account activated successfully! You can now log in.');
      setActiveTab('login');
      // Reset activation form fields
      setActivationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setPassword(''); // clear login password too
    } catch (err) {
      setError(err.message || 'Activation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cp-bg flex flex-col justify-between py-6 px-4">
      {/* Centered Mobile container */}
      <div className="w-full max-w-md mx-auto my-auto bg-cp-surface rounded-3xl shadow-xl overflow-hidden border border-cp-border flex flex-col">
        
        {/* Banner header */}
        <div className="bg-cp-accent text-cp-text-on-accent px-6 py-10 text-center relative border-b border-cp-border">
          <div className="mx-auto w-12 h-12 bg-cp-accent-light/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-cp-text-on-accent animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Campus Pocket</h1>
          <p className="mt-1.5 text-cp-text-on-accent/60 text-xs font-medium uppercase tracking-wider">
            Verified Student Companion
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-cp-border bg-cp-bg/50">
          <button
            type="button"
            className={`w-1/2 py-4 text-center font-display text-sm font-semibold transition-all duration-300 ${
              activeTab === 'login'
                ? 'text-cp-accent bg-cp-surface border-b-2 border-cp-accent'
                : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`w-1/2 py-4 text-center font-display text-sm font-semibold transition-all duration-300 ${
              activeTab === 'activate'
                ? 'text-cp-accent bg-cp-surface border-b-2 border-cp-accent'
                : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`}
            onClick={() => {
              setActiveTab('activate');
              setError('');
              setSuccess('');
            }}
          >
            Activate Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-grow space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-3 text-sm text-red-500">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-3 text-sm text-green-500">
              <UserCheck className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. CS202601"
                  className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
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
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ACTIVATION FORM */
            <form onSubmit={handleActivateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. CS202601"
                  className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
                  Activation Code
                </label>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="e.g. ACT8888"
                  className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3.5 bg-cp-bg border border-cp-border rounded-2xl text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-2 focus:ring-cp-accent/20 focus:border-cp-accent transition-all"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cp-text-secondary uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Activate & Set Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-cp-text-secondary font-medium p-4">
          Contact administrator if you forget your password or need an activation code.
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
