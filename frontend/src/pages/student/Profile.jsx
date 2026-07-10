import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { getCachedData, setCachedData, isCacheValid } from '../../utils/dataCache';
import { 
  User, Phone, GraduationCap, Layers, KeyRound, 
  LogOut, ShieldAlert, CheckCircle, Sun, Moon,
  Camera, Trash2, Loader2, AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { 
    user, 
    logout, 
    changePassword,
    updateAvatar 
  } = useAuth();
  
  const [profile, setProfile] = useState(() => getCachedData('profile', user?.username));
  const [loading, setLoading] = useState(() => !getCachedData('profile', user?.username));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Avatar states
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [submittingImage, setSubmittingImage] = useState(false);

  // Password fields
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Dark mode setting state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('cp_theme') === 'dark';
    } catch (e) {
      return false;
    }
  });

  const fetchProfile = async (force = false) => {
    const username = user?.username;
    if (!force && isCacheValid('profile', username)) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setCachedData('profile', username, data);
        setError('');
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load profile data.`;
        setError(msg);
      }
    } catch (err) {
      setError(`Connection error. Failed to load profile.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const goOnline = () => {
      setIsOffline(false);
      fetchProfile(true);
    };
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [user]);

  // Dark Mode Toggle Trigger
  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cp_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cp_theme', 'light');
      }
    } catch (e) {}
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      setError('Cannot change password while offline.');
      return;
    }
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

  // Client-side canvas square crop and resize (512x512) webp uploader
  const handleImageUpload = (e) => {
    if (isOffline) {
      setError('Cannot upload avatar while offline.');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Invalid format. Only JPEG, PNG, and WEBP files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Center crop logic
        const minSize = Math.min(img.width, img.height);
        const sx = (img.width - minSize) / 2;
        const sy = (img.height - minSize) / 2;
        
        ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, 512, 512);
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setError('Image compression failed.');
            return;
          }
          
          const formData = new FormData();
          formData.append('file', blob, 'avatar.webp');

          try {
            setSubmittingImage(true);
            setError('');
            setSuccess('');
            
            const response = await fetch(`${API_BASE_URL}/api/student/avatar/upload`, {
              method: 'POST',
              body: formData,
              credentials: 'include'
            });

            if (response.ok) {
              const result = await response.json();
              updateAvatar(result.avatarUrl);
              setSuccess('Profile picture updated successfully!');
            } else {
              const errData = await response.json().catch(() => ({}));
              setError(errData.message || 'Avatar upload failed.');
            }
          } catch (err) {
            setError('Connection error. Failed to upload profile picture.');
          } finally {
            setSubmittingImage(false);
          }
        }, 'image/webp', 0.85);
      };
    };
  };

  const handleRemoveImage = async () => {
    if (isOffline) {
      setError('Cannot remove avatar while offline.');
      return;
    }
    try {
      setSubmittingImage(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`${API_BASE_URL}/api/student/avatar`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        updateAvatar(null);
        setSuccess('Profile picture removed.');
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Failed to remove profile picture.');
      }
    } catch (err) {
      setError('Connection error. Failed to delete profile picture.');
    } finally {
      setSubmittingImage(false);
    }
  };

  const cleanSemester = (sem) => {
    if (!sem) return '';
    let s = sem.replace(/semester/gi, '').replaceAll(/\s+/g, '').toUpperCase();
    if (/^S+\d+$/.test(s)) {
      return 'S' + s.replace(/^S+/, '');
    } else if (/^\d+$/.test(s)) {
      return 'S' + s;
    }
    return s;
  };

  const cleanBatch = (bat) => {
    if (!bat) return '';
    let b = bat.replace(/batch/gi, '').replaceAll(/\s+/g, '').toUpperCase();
    if (b.length > 1 && b.startsWith('B')) {
      return b.substring(1);
    }
    return b;
  };

  const cleanDept = (dept) => {
    if (!dept) return '';
    let d = dept.trim().toUpperCase();
    if (d === 'AI&DS' || d === 'AIDS' || d === 'AI AND DS' || d === 'AI & DS') {
      return 'AI & DS';
    }
    return d;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 pb-2 space-y-3 flex flex-col w-full max-w-md mx-auto">
      
      {/* Settings Header */}
      <div className="pt-10 pb-1 text-center relative flex flex-col items-center justify-center">
        <h1 className="font-display text-lg font-extrabold tracking-tight text-cp-text-primary">Settings</h1>
        <p className="mt-0.5 text-cp-text-secondary text-[9px] font-bold uppercase tracking-wider">Campus Pocket</p>
      </div>

      {/* Offline Warning Banner */}
      {isOffline && (
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-600 font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Offline mode - showing last updated data</span>
        </div>
      )}

      {/* Status alerts */}
      {error && (
        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-2.5 text-xs text-green-500 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {profile && (
        <>
          {/* User Card */}
          <div className="flex items-center justify-between p-3 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-11 h-11 shrink-0 bg-cp-accent-light rounded-full flex items-center justify-center text-cp-text-primary font-display font-extrabold text-base border border-cp-border overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.name.charAt(0)}</span>
                )}
              </div>
              <div className="truncate">
                <h2 className="text-sm font-bold text-cp-text-primary leading-tight truncate">{profile.name}</h2>
                <p className="text-[10px] font-mono text-cp-text-secondary font-medium mt-0.5">{profile.rollNo}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={isOffline}
              onClick={() => setShowAvatarEdit(!showAvatarEdit)}
              className={`px-2.5 py-1 text-[10px] font-bold text-cp-text-primary hover:text-cp-accent bg-cp-bg hover:bg-cp-accent-light border border-cp-border rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer ${isOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Edit Photo
            </button>
          </div>

          {/* Avatar Edit Accordion Sub-block */}
          {showAvatarEdit && (
            <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3 animate-fadeIn">
              <h3 className="text-[9px] font-bold text-cp-text-secondary uppercase tracking-wider">Customize Photo</h3>
              
              <div className="flex items-center space-x-2 pt-0.5">
                <label className={`flex-grow cursor-pointer text-center py-1.5 bg-cp-bg hover:bg-cp-accent-light text-cp-text-primary border border-cp-border rounded-lg text-xs transition-all font-semibold select-none ${isOffline || submittingImage ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {submittingImage ? 'Uploading...' : 'Choose file'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isOffline || submittingImage}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {user?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isOffline || submittingImage}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
                    title="Remove profile image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Academic block */}
          <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
            <h3 className="text-[9px] font-bold text-cp-text-secondary uppercase tracking-wider">Academic</h3>
            
            <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
              <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Dept</p>
                <p className="text-xs font-bold text-cp-text-primary mt-0.5">{cleanDept(profile.department)}</p>
              </div>
              <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Semester</p>
                <p className="text-xs font-bold text-cp-text-primary mt-0.5">{cleanSemester(profile.semester)}</p>
              </div>
              <div className="p-2 bg-cp-bg border border-cp-border-light rounded-xl">
                <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wide">Batch</p>
                <p className="text-xs font-bold text-cp-text-primary mt-0.5">{cleanBatch(profile.batch)}</p>
              </div>
            </div>
          </div>

          {/* Device Profile info */}
          <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-2.5">
            <h3 className="text-[9px] font-bold text-cp-text-secondary uppercase tracking-wider">Student Contact</h3>
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center space-x-3 text-xs">
                <Phone className="w-3.5 h-3.5 text-cp-text-secondary shrink-0" />
                <span className="text-cp-text-secondary">Phone:</span>
                <span className="font-semibold text-cp-text-primary">{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Theme toggler card */}
          <div className="flex items-center justify-between p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center space-x-3 text-xs">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-cp-accent shrink-0 animate-pulse" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div className="text-left">
                <p className="font-bold text-cp-text-primary">Interface Theme</p>
                <p className="text-[9px] text-cp-text-secondary font-medium">Switch between light and dark look</p>
              </div>
            </div>
            <button
              onClick={handleToggleTheme}
              className="px-2.5 py-1 text-[10px] font-bold text-cp-text-primary hover:text-cp-accent bg-cp-bg hover:bg-cp-accent-light border border-cp-border rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Update password triggers block */}
          <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs">
                <KeyRound className="w-4 h-4 text-cp-text-secondary shrink-0" />
                <span className="font-bold text-cp-text-primary">Change Password</span>
              </div>
              <button
                type="button"
                disabled={isOffline}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`px-2.5 py-1 text-[10px] font-bold text-cp-text-primary hover:text-cp-accent bg-cp-bg hover:bg-cp-accent-light border border-cp-border rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer ${isOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {showPasswordForm ? 'Cancel' : 'Modify'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2 animate-fadeIn border-t border-cp-border/50">
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="w-full py-2 bg-cp-accent text-cp-text-on-accent font-bold text-xs rounded-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {submittingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update Password</span>}
                </button>
              </form>
            )}
          </div>
        </>
      )}

      {/* Danger block */}
      <div className="p-3.5 bg-cp-surface rounded-2xl border border-cp-border-light shadow-[0_1px_2px_rgba(0,0,0,0.01)] space-y-3">
        <h3 className="text-[9px] font-bold text-cp-text-secondary uppercase tracking-wider">Danger</h3>
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-display font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 border border-red-500/20 text-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-2">
        <span className="text-[9px] text-cp-text-secondary font-medium">
          Academic data is managed centrally by administrators.
        </span>
      </div>
    </div>
  );
};

export default Profile;
