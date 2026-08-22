import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    const loadInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error loading current user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialUser();

    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const u = await authService.getCurrentUser();
          setUser(u);
          setIsDemoMode(false);
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email, password) => {
    const loggedInUser = await authService.signIn(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (email, password, fullName) => {
    const newUser = await authService.signUp(email, password, fullName);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const switchDemo = async (role) => {
    const demoUser = await authService.switchDemoAccount(role);
    setUser(demoUser);
    setIsDemoMode(true);
    return demoUser;
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        login,
        signup,
        logout,
        switchDemo,
        updateProfile,
        isSupabaseReady: isSupabaseConfigured()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
