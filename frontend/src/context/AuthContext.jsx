import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getStoredUser,
  fetchCurrentUserProfile,
  updateUserProfile,
  changeUserPassword
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync user profile from backend on mount or when user id changes
  useEffect(() => {
    const refresh = async () => {
      const stored = getStoredUser();
      if (stored && stored.id) {
        try {
          const fresh = await fetchCurrentUserProfile(stored.id);
          if (fresh) {
            setCurrentUser(fresh);
          }
        } catch (e) {
          console.warn('Cannot refresh user profile:', e);
        }
      }
    };
    refresh();
  }, []);

  const login = async (identifier, password) => {
    const data = await loginUser(identifier, password);
    setCurrentUser(data);
    setIsAuthModalOpen(false);
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setCurrentUser(data);
    setIsAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  const updateProfile = async (profileData) => {
    if (!currentUser?.id) throw new Error('Chưa đăng nhập');
    const updated = await updateUserProfile(currentUser.id, profileData);
    setCurrentUser(updated);
    return updated;
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!currentUser?.id) throw new Error('Chưa đăng nhập');
    return await changeUserPassword(currentUser.id, { oldPassword, newPassword });
  };

  const refreshUser = async () => {
    if (currentUser?.id) {
      const fresh = await fetchCurrentUserProfile(currentUser.id);
      if (fresh) setCurrentUser(fresh);
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        // Modal state
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
