import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

const TOKEN_KEY = "polylingo_token";
const BASE = import.meta.env.BASE_URL ?? "/";
const API = BASE.replace(/\/$/, "") + "/api";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken() ?? ""}`,
  });

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/auth/me`, { headers: headers() });
      if (res.ok) {
        const u = await res.json() as AuthUser;
        setUser(u);
      } else {
        clearToken();
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchMe(); }, [fetchMe]);

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    setToken(data.token!);
    setUser(data.user!);
    return data.user!;
  };

  const login = async (email: string, password: string): Promise<{ message: string; devOtp?: string }> => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as { message?: string; devOtp?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    return { message: data.message ?? "Code sent", devOtp: data.devOtp };
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Invalid code");
    setToken(data.token!);
    setUser(data.user!);
    return data.user!;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return { user, loading, register, login, verifyOtp, logout, getToken };
}
