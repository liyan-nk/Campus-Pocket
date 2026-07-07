import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

const StudentLogin = () => {
  const { loginStudent, activateStudent } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'activate'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!rollNo || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await loginStudent(rollNo.toUpperCase().trim(), password);
      if (user.mustChangePassword) {
        navigate('/force-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Incorrect Roll Number or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rollNo || !activationCode || !newPassword || !confirmPassword) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-6 px-4">
      {/* Centered Mobile container */}
      <div className="w-full max-w-md mx-auto my-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Banner header */}
        <div className="bg-gradient-to-tr from-purple-700 to-indigo-600 px-6 py-10 text-center text-white relative">
          <div className="mx-auto w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-purple-200 animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Campus Pocket</h1>
          <p className="mt-1.5 text-purple-100 text-xs font-medium uppercase tracking-wider">
            Verified Student Companion
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            className={`w-1/2 py-4 text-center font-display text-sm font-semibold transition-all duration-300 ${
              activeTab === 'login'
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-400 hover:text-gray-600'
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
                ? 'text-purple-600 bg-white border-b-2 border-purple-600'
                : 'text-gray-400 hover:text-gray-600'
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

        <div className="p-6 flex-grow flex flex-col justify-between">
          <div>
            {/* Status alerts */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3 text-sm text-red-800 animate-shake">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start space-x-3 text-sm text-green-800">
                <UserCheck className="w-5 h-5 text-green-500 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. CS202601"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono uppercase"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. CS202601"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono uppercase"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Activation Code
                  </label>
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="e.g. ACT8888"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono uppercase"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Activate & Set Password</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center text-xs text-gray-400 font-medium">
            Contact administrator if you forget your password or need an activation code.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
