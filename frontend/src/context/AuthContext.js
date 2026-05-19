import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginAPI, register as registerAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await loginAPI({ email, password });
    const { token: tk, user: u } = res.data;
    localStorage.setItem("token", tk);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await registerAPI({ name, email, password });
    const { token: tk, user: u } = res.data;
    localStorage.setItem("token", tk);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
