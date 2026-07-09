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
    <div className="min-h-screen bg-cp-bg flex items-center justify-center p-3 select-none">
      {/* Centered Mobile container */}
      <div className="w-full max-w-[380px] bg-cp-surface rounded-3xl shadow-xl overflow-hidden border border-cp-border flex flex-col">
        
        {/* Banner header */}
        <div className="bg-cp-accent text-cp-text-on-accent px-5 py-6 text-center relative border-b border-cp-border">
          <div className="mx-auto w-10 h-10 bg-cp-accent-light/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-cp-text-on-accent animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Campus Pocket</h1>
          <p className="mt-1 text-cp-text-on-accent/60 text-[10px] font-medium uppercase tracking-wider">
            Verified Student Companion
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-cp-border bg-cp-bg/50">
          <button
            type="button"
            className={`w-1/2 py-3.5 text-center font-display text-xs font-bold transition-all duration-300 ${
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
            className={`w-1/2 py-3.5 text-center font-display text-xs font-bold transition-all duration-300 ${
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
        <div className="p-5 flex-grow space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-3 p-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-2.5 text-xs text-green-500">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. CS202601"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 py-3 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-display font-semibold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <div className="w-4.5 h-4.5 border-2 border-cp-text-on-accent border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ACTIVATION FORM */
            <form onSubmit={handleActivateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. CS202601"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Activation Code
                </label>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="e.g. ACT8888"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all font-mono uppercase"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Create Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider mb-0.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2.5 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary focus:outline-none focus:ring-1 focus:ring-cp-accent/20 focus:border-cp-accent transition-all"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 py-3 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-display font-semibold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <div className="w-4.5 h-4.5 border-2 border-cp-text-on-accent border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Activate & Set Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center text-[10px] text-cp-text-secondary font-medium p-3 border-t border-cp-border/5 bg-cp-bg/10">
          Contact administrator if you forget your password or need an activation code.
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
