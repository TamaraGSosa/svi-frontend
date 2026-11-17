import type { AuthSession, LoginCredentials, User } from "@/types";
import { apiRequest } from "./apiClient";
import { tokenStorage } from "./tokenStorage";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
      skipRefresh: true,
    });
    tokenStorage.setSession(session.accessToken, session.refreshToken, session.user);
    return session;
  },

  async getMe(): Promise<User> {
    const user = await apiRequest<User>("/auth/me", { method: "GET" });
    tokenStorage.setUser(user);
    return user;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        skipRefresh: true,
      });
    } catch {
      // ignore logout transport errors and clear local session
    } finally {
      tokenStorage.clear();
    }
  },
};
