/**
 * Shared API base URL and auth header helper for backend (Django) API calls.
 * Set VITE_API_BASE_URL in frontend/.env before `npm run build`.
 * Empty value = same-origin (/api/...) when nginx proxies to Django.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env?.VITE_API_BASE_URL;
  if (raw !== undefined && raw !== null) {
    return String(raw).trim().replace(/\/$/, "");
  }
  return "";
}

export const API_BASE_URL = resolveApiBaseUrl();

const AUTH_TOKEN_KEY = "pakistan_customs_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }
  return headers;
}

export function getAuthHeadersFormData(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }
  return headers;
}
