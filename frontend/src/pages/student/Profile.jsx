import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { 
  User, Phone, GraduationCap, Layers, KeyRound, 
  LogOut, ShieldAlert, CheckCircle, Sun, Moon 
} from 'lucide-react';

const Profile = () => {
  const { logout, changePassword } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch student profile details
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setError('Failed to load profile data.');
      }
    } catch (err) {
      setError('Connection error. Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
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

    setSubmittingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || 'Password change failed.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cp-bg flex flex-col justify-between py-4 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md mx-auto space-y-3 flex flex-col">
        
        {/* Settings Header */}
        <div className="pt-10 pb-2 text-center relative flex flex-col items-center justify-center">
          <h1 className="font-display text-xl font-extrabold tracking-tight text-cp-text-primary">Settings</h1>
          <p className="mt-0.5 text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Campus Pocket</p>
        </div>

        {/* Status alerts */}
        {error && (
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-3 text-xs text-red-500">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-3 text-xs text-green-500">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {profile && (
          <>
            {/* User Card */}
            <div className="flex items-center space-x-3 p-3 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <div className="w-11 h-11 bg-cp-accent-light rounded-full flex items-center justify-center text-cp-text-primary font-display font-extrabold text-base border border-cp-border">
                {profile.name.charAt(0)}
              </div>
              <div className="truncate">
                <h2 className="text-sm font-bold text-cp-text-primary leading-tight truncate">{profile.name}</h2>
                <p className="text-[10px] font-mono text-cp-text-secondary font-medium mt-0.5">{profile.rollNo}</p>
              </div>
            </div>

            {/* Academic block */}
            <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
              <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Academic</h3>
              
              <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
                <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                  <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Dept</p>
                  <p className="text-xs font-bold text-cp-text-primary mt-0.5">{(profile.department || '').toUpperCase()}</p>
                </div>
                <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                  <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Sem</p>
                  <p className="text-xs font-bold text-cp-text-primary mt-0.5">{(profile.semester || '').toUpperCase()}</p>
                </div>
                <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                  <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Batch</p>
                  <p className="text-xs font-bold text-cp-text-primary mt-0.5">{(profile.batch || '').toUpperCase()}</p>
                </div>
              </div>
              
              <div className="border-t border-cp-border-light pt-2 flex items-center justify-between text-xs px-0.5">
                <span className="text-cp-text-secondary font-medium flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-2" />
                  Phone
                </span>
                <span className="font-mono text-cp-text-primary font-semibold">{profile.phone}</span>
              </div>
            </div>
          </>
        )}

        {/* Settings block */}
        <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
          <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Appearance</h3>
          
          {/* Theme Toggle option */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cp-bg rounded-xl text-cp-text-secondary border border-cp-border-light">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-cp-text-primary">Dark Mode</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-cp-bg border border-cp-border"
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-cp-accent shadow-sm transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-cp-border-light pt-2"></div>

          {/* Change Password toggle/button */}
          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-cp-text-primary flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-2" />
                Change Password
              </h4>
              
              <div className="space-y-2">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full px-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent text-cp-text-primary"
                  disabled={submittingPassword}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min 6 chars)"
                  className="w-full px-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent text-cp-text-primary"
                  disabled={submittingPassword}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full px-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent text-cp-text-primary"
                  disabled={submittingPassword}
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="w-1/2 py-2 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-semibold text-[10px] rounded-xl transition-all"
                >
                  {submittingPassword ? 'Saving...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="w-1/2 py-2 bg-cp-bg hover:bg-cp-accent-light text-cp-text-primary font-semibold text-[10px] rounded-xl transition-all border border-cp-border"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                setError('');
                setSuccess('');
              }}
              className="w-full py-2 border border-dashed border-cp-border hover:border-cp-accent text-cp-text-secondary hover:text-cp-text-primary font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {/* Danger block */}
        <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
          <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Danger</h3>
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-display font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 border border-red-500/20 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <span className="text-[10px] text-cp-text-secondary font-medium">
          Academic data is managed centrally by administrators.
        </span>
      </div>
    </div>
  );
};

export default Profile;
