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
import { AxiosError } from "axios";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data } = await authService.me();
        setUser(data.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status !== 401) {
            console.error("Auth check failed:", err);
          }
        } else {
          console.error("Unexpected error:", err);
        }
        setUser(null);
        localStorage.removeItem("isLoggedIn");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    await authService.login(data);
    localStorage.setItem("isLoggedIn", "true");

    try {
      const { data: res } = await authService.me();
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user after login:", err);
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("isLoggedIn");
      setUser(null);
      router.replace("/login");
    }
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