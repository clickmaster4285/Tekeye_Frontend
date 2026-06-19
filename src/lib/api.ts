/**
 * Shared API base URL and auth header helper for backend (Django) API calls.
 *
 * Configure VITE_API_BASE_URL in frontend/.env only (never hardcode hosts in source).
 * - Empty: same-origin (/api/...) — works for LAN and public when nginx proxies /api/.
 * - Full URL: direct calls to Django (e.g. local dev without the Vite proxy).
 */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");

/** Join VITE_API_BASE_URL with a site path (empty base = same-origin). */
export function resolveApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized;
}

/** Build a Django REST path under /api/. */
export function apiUrl(pathWithinApi = ""): string {
  const segment = pathWithinApi.replace(/^\/+/, "");
  return resolveApiUrl(segment ? `/api/${segment}` : "/api");
}

/** Build a URL for uploaded media under /media/. */
export function mediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return resolveApiUrl(`/media/${clean}`);
}

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
