import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRealtimeSocket, type RealtimeListener } from "@/hooks/useRealtimeSocket";
import { setOnSessionExpired } from "@/services/apiClient";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";
import type { LoginCredentials, User, WsConnectionState } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  wsState: WsConnectionState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  subscribeRealtime: (listener: RealtimeListener) => () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(tokenStorage.getAccessToken()));

  const isAuthenticated = Boolean(user && tokenStorage.getAccessToken());
  const { wsState, subscribe } = useRealtimeSocket(isAuthenticated);

  const handleExpired = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnSessionExpired(handleExpired);
    return () => setOnSessionExpired(null);
  }, [handleExpired]);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    authService
      .getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) {
          tokenStorage.clear();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const me = await authService.getMe();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      wsState,
      login,
      logout,
      refreshProfile,
      subscribeRealtime: subscribe,
    }),
    [user, isAuthenticated, isLoading, wsState, login, logout, refreshProfile, subscribe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
