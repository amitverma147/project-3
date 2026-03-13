"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authService, LoginPayload } from "@/services/auth.service";
import { User } from "@/types/user";

// ── Types 
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context 
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 
  useEffect(() => {
    authService
      .me()
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    await authService.login(data); // sets httpOnly cookie
    const { data: res } = await authService.me(); // fetch full user object
    setUser(res.data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
