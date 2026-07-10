import React, { createContext, useState, useEffect, useContext } from 'react';
import API_BASE_URL from '../config/api';
import { clearCache } from '../utils/dataCache';

const AuthContext = createContext(null);

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage read failed for key ${key}:`, e);
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage write failed for key ${key}:`, e);
  }
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage remove failed for key ${key}:`, e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = safeGetItem('cp_user_data');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check auth status on load
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data);
          safeSetItem('cp_user_data', JSON.stringify(data));
        } else {
          setUser(null);
          safeRemoveItem('cp_user_data');
        }
        setLoading(false);
      } else {
        if (response.status === 401) {
          setUser(null);
          safeRemoveItem('cp_user_data');
          setLoading(false);
        } else {
          // Keep current state on other temporary errors and retry
          console.warn(`Temporary backend error status ${response.status}. Retrying auth check...`);
          setLoading(false);
          setTimeout(checkAuthStatus, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Keep current state on connection/network error and retry
      setLoading(false);
      setTimeout(checkAuthStatus, 5000);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loginStudent = async (rollNo, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNo, password }),
      credentials: 'include',
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    setUser(data);
    safeSetItem('cp_user_data', JSON.stringify(data));
    return data;
  };

  const loginAdmin = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Admin login failed');
    }
    setUser(data);
    safeSetItem('cp_user_data', JSON.stringify(data));
    return data;
  };

  const activateStudent = async (rollNo, activationCode, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/student/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNo, activationCode, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Activation failed');
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      safeRemoveItem('cp_user_data');
      clearCache();
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }
    // Update local user state in case mustChangePassword was cleared
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      safeSetItem('cp_user_data', JSON.stringify(updatedUser));
    }
    return data;
  };

  const [avatarMode, setAvatarMode] = useState('initials');
  const [avatarInitials, setAvatarInitials] = useState('');
  const [avatarImage, setAvatarImage] = useState('');

  const fetchAvatar = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/avatar`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvatarMode(data.avatarMode?.toLowerCase() || 'initials');
        setAvatarInitials(data.avatarInitials || '');
        setAvatarImage(data.avatarImage || '');
      }
    } catch (e) {
      console.error('Failed to load student avatar from database:', e);
    }
  };

  // Sync avatar data from backend on user change
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      fetchAvatar();
    } else {
      setAvatarMode('initials');
      setAvatarInitials('');
      setAvatarImage('');
    }
  }, [user]);

  // Synchronize avatar updates with database
  const updateAvatar = async (mode, initials, imageBase64) => {
    if (!user) return;
    
    // Optimistic UI updates
    setAvatarMode(mode);
    setAvatarInitials(initials);
    setAvatarImage(imageBase64);

    if (user.role !== 'ADMIN') {
      try {
        await fetch(`${API_BASE_URL}/api/student/avatar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            avatarMode: mode.toUpperCase(),
            avatarInitials: initials,
            avatarImage: imageBase64
          })
        });
      } catch (e) {
        console.error('Failed to sync avatar update with database:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginStudent,
        loginAdmin,
        activateStudent,
        logout,
        changePassword,
        checkAuthStatus,
        avatarMode,
        avatarInitials,
        avatarImage,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
