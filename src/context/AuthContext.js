import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("snsi_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const signIn = useCallback((userData, token) => {
    localStorage.setItem("snsi_token", token);
    localStorage.setItem("snsi_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("snsi_token");
    localStorage.removeItem("snsi_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
