import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { User, Phone, BookOpen, GraduationCap, Layers, KeyRound, LogOut, ShieldAlert, CheckCircle } from 'lucide-react';

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

  // Fetch student profile details
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        credentials: 'include'
      });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-6 px-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Banner header */}
        <div className="bg-gradient-to-tr from-purple-700 to-indigo-600 px-6 py-8 text-center text-white relative">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Student Profile</h1>
          <p className="mt-1 text-purple-100 text-xs font-medium">Campus Pocket Companion</p>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow space-y-6">
          
          {/* Status alerts */}
          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3 text-sm text-red-800">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start space-x-3 text-sm text-green-800">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {profile && (
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 font-display font-extrabold text-xl">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{profile.name}</h2>
                  <p className="text-sm font-mono text-gray-500 font-medium">{profile.rollNo}</p>
                </div>
              </div>

              {/* Profile Metadata List */}
              <div className="space-y-3 p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center text-sm py-1">
                  <BookOpen className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Department</p>
                    <p className="font-semibold text-gray-800">{profile.department}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-50 my-2"></div>
                
                <div className="flex items-center text-sm py-1">
                  <GraduationCap className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Semester</p>
                    <p className="font-semibold text-gray-800">Semester {profile.semester}</p>
                  </div>
                </div>

                <div className="border-t border-gray-50 my-2"></div>

                <div className="flex items-center text-sm py-1">
                  <Layers className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Batch</p>
                    <p className="font-semibold text-gray-800">Batch {profile.batch}</p>
                  </div>
                </div>

                <div className="border-t border-gray-50 my-2"></div>

                <div className="flex items-center text-sm py-1">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                    <p className="font-semibold text-gray-800">{profile.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Password Change Form */}
          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-fadeIn">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                <KeyRound className="w-4 h-4 text-purple-600 mr-2" />
                Change Password
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  disabled={submittingPassword}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  disabled={submittingPassword}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  disabled={submittingPassword}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="w-1/2 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  {submittingPassword ? 'Saving...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="w-1/2 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-xl transition-all"
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
              className="w-full py-4 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-500 hover:text-purple-600 font-semibold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-display font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2 border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center">
          <span className="text-xs text-gray-400 font-medium">
            Academic data is managed centrally by administrators.
          </span>
        </div>

      </div>
    </div>
  );
};

export default Profile;
