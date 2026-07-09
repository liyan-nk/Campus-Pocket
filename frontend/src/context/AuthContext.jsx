import React, { createContext, useState, useEffect, useContext } from 'react';
import API_BASE_URL from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { authenticated, role, username, name, mustChangePassword }
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
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
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
      setUser({ ...user, mustChangePassword: false });
    }
    return data;
  };

  const [avatarMode, setAvatarMode] = useState('initials');
  const [avatarInitials, setAvatarInitials] = useState('');
  const [avatarImage, setAvatarImage] = useState('');

  // Sync avatar data from localStorage on user change
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      const mode = localStorage.getItem(`cp_avatar_${user.username}_mode`) || 'initials';
      const initials = localStorage.getItem(`cp_avatar_${user.username}_initials`) || user.name?.charAt(0) || '';
      const img = localStorage.getItem(`cp_avatar_${user.username}_image`) || '';
      
      setAvatarMode(mode);
      setAvatarInitials(initials);
      setAvatarImage(img);
    } else {
      setAvatarMode('initials');
      setAvatarInitials('');
      setAvatarImage('');
    }
  }, [user]);

  // Future-proof avatar update logic (can be redirected to backend later)
  const updateAvatar = async (mode, initials, imageBase64) => {
    if (!user) return;
    localStorage.setItem(`cp_avatar_${user.username}_mode`, mode);
    localStorage.setItem(`cp_avatar_${user.username}_initials`, initials);
    localStorage.setItem(`cp_avatar_${user.username}_image`, imageBase64);
    
    setAvatarMode(mode);
    setAvatarInitials(initials);
    setAvatarImage(imageBase64);
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
