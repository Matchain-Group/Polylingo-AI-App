import { createContext, useContext, type ReactNode } from "react";
import { useAuth, type AuthUser } from "@/hooks/use-auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<{ message: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
