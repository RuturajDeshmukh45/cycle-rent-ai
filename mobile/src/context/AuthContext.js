import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        const storedUser  = await SecureStore.getItemAsync('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    restore();
  }, []);

  const login = async (userData, authToken) => {
    await SecureStore.setItemAsync('token', authToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (userData) => {
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
