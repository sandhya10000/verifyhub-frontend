import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear stale pre-login path so it doesn't interfere with future sessions
    sessionStorage.removeItem('preLoginPath');
    setUser(null);
    setToken(null);
    // NOTE: Navigation after logout is intentionally handled by the calling
    // component (e.g. PartnerLayout), NOT here. This keeps logout() reusable
    // and prevents the auth context from fighting with component-level navigate() calls.
  };

  // Re-read the live wallet balance from the server and sync it into
  // context + localStorage. Call after any wallet-moving action
  // (report pull, recharge) so every screen shows fresh numbers
  // without a dashboard round-trip. Silent on failure.
  const refreshWallet = async () => {
    try {
      const t = localStorage.getItem('token');
      if (!t) return;
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/partner/overview/summary`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data?.success && data.data?.walletBalance != null) {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            walletBalance: data.data.walletBalance,
            activePlan: data.data.activePlan || prev.activePlan,
            pendingPlanChoice: data.data.pendingPlanChoice ?? prev.pendingPlanChoice ?? false,
          };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // silent — stale balance is non-fatal
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
};
