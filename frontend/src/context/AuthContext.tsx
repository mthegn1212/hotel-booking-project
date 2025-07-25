import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "../config/axiosConfig";

type User = { name: string; /*...*/ };
type AuthContextType = {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Khi có token mới, tự fetch profile
  const login = async (token: string) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const res = await axios.get<User>("/api/v1/users/me");
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // Mounted: nếu đã có token, gọi login() để fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) login(token).catch(() => logout());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};