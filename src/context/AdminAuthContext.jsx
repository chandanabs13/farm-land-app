import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as ordersApi from '../api/orders';

const SESSION_KEY = 'coorg_admin_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (!token || Date.now() > expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(loadSession);

  const login = async (password) => {
    try {
      const { token: newToken } = await ordersApi.loginAdmin(password);
      const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ token: newToken, expiresAt }));
      setToken(newToken);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setToken(null);
  };

  const getToken = useCallback(() => token, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loadSession()) setToken(null);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed: !!token, token, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);
