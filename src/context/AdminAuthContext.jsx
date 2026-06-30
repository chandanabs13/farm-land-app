import { createContext, useContext, useState, useEffect } from 'react';

// ─── Set your admin password here ───────────────────────────────────────────
// Change this to whatever you and your husband want to use.
const ADMIN_PASSWORD = 'CoorgFarm@2026';

// Session expires after this many hours of inactivity
const SESSION_HOURS = 12;

const AuthContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem('coorg_admin_session');
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      localStorage.removeItem('coorg_admin_session');
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(loadSession());

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
      localStorage.setItem('coorg_admin_session', JSON.stringify({ expiresAt }));
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('coorg_admin_session');
    setIsAuthed(false);
  };

  // Re-check session validity on mount and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loadSession()) setIsAuthed(false);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);
