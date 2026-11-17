const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const rawWsUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();

const normalizedInput = (rawApiUrl || "http://localhost:8000").replace(/\/+$/, "");

export const API_BASE_URL = normalizedInput.replace(/\/api\/v1$/i, "");
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

function toWsBase(httpBase: string): string {
  if (httpBase.startsWith("https://")) {
    return `wss://${httpBase.slice("https://".length)}`;
  }
  if (httpBase.startsWith("http://")) {
    return `ws://${httpBase.slice("http://".length)}`;
  }
  return httpBase;
}

export const WS_URL = rawWsUrl
  ? rawWsUrl.replace(/\/+$/, "")
  : `${toWsBase(API_BASE_URL)}/api/v1/ws`;

export function resolveApiAssetUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE_URL}${normalized}`;
}
