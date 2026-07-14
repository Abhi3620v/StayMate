import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [completeness, setCompleteness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount & listen to token rotation failures
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setCompleteness(null);
      localStorage.removeItem('accessToken');
    };
    window.addEventListener('auth:logout', handleAuthLogout);

    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe();
        setUser(data.user);
        setCompleteness(data.completeness);
      } catch (error) {
        // If recovery fails, clear memory
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      setCompleteness(data.completeness);
      toast.success('Successfully logged in!');
      return data.user;
    } catch (error) {
      const responseData = error.response?.data;
      const msg = 
        (typeof responseData?.error === 'string' ? responseData.error : responseData?.error?.message) || 
        responseData?.message || 
        'Login failed. Please try again.';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password, role });
      toast.success(response.message || 'Registration successful! Check console for activation link.');
      return response;
    } catch (error) {
      const responseData = error.response?.data;
      const msg = 
        (typeof responseData?.error === 'string' ? responseData.error : responseData?.error?.message) || 
        responseData?.message || 
        'Registration failed.';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken, role = 'tenant', isRegistering = false) => {
    setLoading(true);
    try {
      const data = await authService.googleLogin(idToken, role, isRegistering);
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      setCompleteness(data.completeness);
      toast.success('Successfully signed in with Google!');
      return data.user;
    } catch (error) {
      console.log('GOOGLE LOGIN ERROR RESPONSE:', error.response?.data);
      const responseData = error.response?.data;
      const msg = 
        (typeof responseData?.error === 'string' ? responseData.error : responseData?.error?.message) || 
        responseData?.message || 
        'Google sign-in failed.';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      // Proceed with local logout regardless of network error
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setCompleteness(null);
      setLoading(false);
      toast.success('Successfully logged out.');
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const data = await userService.updateProfile(updateData);
      setUser(data.user);
      setCompleteness(data.completeness);
      toast.success('Profile settings updated!');
      return data.user;
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to update profile.';
      toast.error(msg);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await userService.deleteAccount();
      setUser(null);
      setCompleteness(null);
      localStorage.removeItem('accessToken');
      toast.success('Your account has been deleted.');
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to delete account.';
      toast.error(msg);
      throw error;
    }
  };

  // Switch role locally to support sandbox navbar dashboard views
  const switchRole = (newRole) => {
    if (!newRole || newRole === 'guest') {
      setUser(null);
      setCompleteness(null);
      localStorage.removeItem('accessToken');
    } else {
      const updatedUser = {
        ...(user || { name: `${newRole.charAt(0).toUpperCase() + newRole.slice(1)} User`, email: `${newRole}@staymate.com` }),
        role: newRole,
      };
      setUser(updatedUser);
      toast.success(`Role switched to ${newRole} (Sandbox Mode)`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        completeness,
        setCompleteness,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        deleteAccount,
        switchRole,
        isAuthenticated: !!user,
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
