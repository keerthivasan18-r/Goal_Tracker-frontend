import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Profile, Settings } from '../types/index';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  settings: Settings | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateContextProfile: (updatedProfile: Profile) => void;
  updateContextSettings: (updatedSettings: Settings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('goal_tracker_token');
      const storedUserJson = localStorage.getItem('goal_tracker_user');

      if (storedToken && storedUserJson) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUserJson);
          setUser(parsedUser);
          
          // Fetch current profile & settings from backend
          const res = await api.get('/profile');
          setProfile(res.data.profile);
          setSettings(res.data.settings);
        } catch (error) {
          console.error('Failed to load profile on auth init:', error);
          // Token might be invalid/expired, log out
          localStorage.removeItem('goal_tracker_token');
          localStorage.removeItem('goal_tracker_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('goal_tracker_token', newToken);
    localStorage.setItem('goal_tracker_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    if (userData.profile) {
      setProfile(userData.profile);
    }
    refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('goal_tracker_token');
    localStorage.removeItem('goal_tracker_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    setSettings(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data.profile);
      setSettings(res.data.settings);
      
      // Keep local user profile copy updated
      const storedUser = localStorage.getItem('goal_tracker_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.profile = res.data.profile;
        localStorage.setItem('goal_tracker_user', JSON.stringify(u));
        setUser(u);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const updateContextProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    const storedUser = localStorage.getItem('goal_tracker_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      u.profile = updatedProfile;
      localStorage.setItem('goal_tracker_user', JSON.stringify(u));
      setUser(u);
    }
  };

  const updateContextSettings = (updatedSettings: Settings) => {
    setSettings(updatedSettings);
  };

  const value = {
    user,
    profile,
    settings,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    refreshProfile,
    updateContextProfile,
    updateContextSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
