import { API_V1_URL, resolveApiAssetUrl } from "@/config/env";
import { ApiError, type ApiErrorPayload, type AuthSession } from "@/types";
import { tokenStorage } from "./tokenStorage";

const REQUEST_TIMEOUT_MS = 20_000;

let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  timeoutMs?: number;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = `${API_V1_URL}${normalized}`;
  if (!params) return base;
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      search.append(key, String(val));
    }
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let code = "http_error";
  let message = `Error ${response.status}`;
  let details: Record<string, unknown> | undefined;

  try {
    const data = (await response.json()) as Partial<ApiErrorPayload> & {
      detail?: string;
    };
    if (data.error) {
      code = data.error.code || code;
      message = data.error.message || message;
      details = data.error.details;
    } else if (typeof data.detail === "string") {
      message = data.detail;
    }
  } catch {
    // non-json response
  }

  return new ApiError(message, response.status, code, details);
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        tokenStorage.clear();
        onSessionExpired?.();
        return null;
      }
      const session = (await res.json()) as AuthSession;
      tokenStorage.setSession(session.accessToken, session.refreshToken ?? refreshToken, session.user);
      return session.accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  params?: Record<string, string | number | boolean | undefined | null>,
): Promise<T> {
  const { skipAuth = false, skipRefresh = false, timeoutMs = REQUEST_TIMEOUT_MS, headers, body, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = {};
    if (!isFormData) {
      h["Content-Type"] = "application/json";
    }
    if (token && !skipAuth) {
      h["Authorization"] = `Bearer ${token}`;
    }
    if (headers) {
      Object.assign(h, headers as Record<string, string>);
    }
    return h;
  };

  try {
    const url = buildUrl(path, params);
    const token = skipAuth ? null : tokenStorage.getAccessToken();

    let response = await fetch(url, {
      ...rest,
      body,
      headers: buildHeaders(token),
      signal: controller.signal,
    });

    if (response.status === 401 && !skipAuth && !skipRefresh) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await fetch(url, {
          ...rest,
          body,
          headers: buildHeaders(newToken),
          signal: controller.signal,
        });
      } else {
        tokenStorage.clear();
        onSessionExpired?.();
      }
    }

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Tiempo de espera agotado al conectar con el servidor", 408, "timeout");
    }
    throw new ApiError(
      err instanceof Error ? err.message : "No se pudo conectar con el servidor",
      0,
      "network_error",
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchAuthorizedImageBlobUrl(pathOrUrl: string): Promise<string | null> {
  const resolved = resolveApiAssetUrl(pathOrUrl);
  if (!resolved) return null;

  const token = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(resolved, { headers });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(resolved, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
    }
  }
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
