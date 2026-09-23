"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import {
  clearSession,
  getStoredToken,
  setSession,
} from "@/lib/auth-storage";
import type { AuthUser, SessionUser } from "@/lib/types";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  isMember: boolean;
  isAdmin: boolean;
  /** Simpan sesi setelah login/registrasi berhasil. */
  signIn: (auth: AuthUser) => void;
  /** Hapus sesi. */
  signOut: () => void;
  /** Muat ulang profil dari server. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authApi.profile(token);
      setUser(profile);
    } catch {
      // Token kedaluwarsa / tidak valid
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const signIn = useCallback((auth: AuthUser) => {
    setSession(auth.access_token, auth.role);
    const { access_token: _token, ...session } = auth;
    void _token;
    setUser({
      id: session.id,
      username: session.username,
      role: session.role,
      member: session.member ?? null,
      space_owner: session.space_owner ?? null,
    });
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isMember: user?.role === "member",
      isAdmin: user?.role === "admin_space",
      signIn,
      signOut,
      refresh: hydrate,
    }),
    [user, loading, signIn, signOut, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}
