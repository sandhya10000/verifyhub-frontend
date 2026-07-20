import { useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setUser({
        token,
      });
    }

    setLoading(false);
  }, []);

  const login = (token, userData = {}) => {
    localStorage.setItem("token", token);

    setUser({
      token,
      ...userData,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
