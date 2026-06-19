<<<<<<< HEAD
import { apiUrl, getAuthHeaders, getStoredToken, resolveApiUrl } from "@/lib/api";
=======
import { API_BASE_URL, getAuthHeaders, getStoredToken } from "@/lib/api";
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68

export type CameraPurpose =
  | "surveillance"
  | "object_detection"
  | "face_recognition"
  | "attendance"
  | "anpr"
  | "zone_monitoring"
  | "thermal";

export type NvrBrand = "hikvision" | "dahua" | "uniview" | "generic";

export type SiteRecord = {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  nvr_count: number;
  camera_count: number;
  created_at?: string;
  updated_at?: string;
};

export type SiteWritePayload = {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
};

export type NvrRecord = {
  id: number;
  site: number;
  site_code: string;
  site_name: string;
  name: string;
  ip_address: string;
  port: number;
  username: string;
  password_set: boolean;
  brand: NvrBrand;
  brand_label: string;
  stream_path_template: string;
  is_active: boolean;
  camera_count: number;
  created_at?: string;
  updated_at?: string;
};

export type NvrWritePayload = {
  site: number;
  name: string;
  ip_address: string;
  port?: number;
  username?: string;
  password?: string;
  brand?: NvrBrand;
  stream_path_template?: string;
  is_active?: boolean;
};

export type CameraRecord = {
  id: number;
  code: string;
  name: string;
  nvr: number;
  channel: number;
  channel_label: string;
  site_code: string;
  site_name: string;
  nvr_name: string;
  nvr_ip: string;
  location: string;
  zone: string;
  purpose: CameraPurpose;
  purpose_label: string;
  status: string;
  is_active: boolean;
  ml_enabled: boolean;
  is_rtsp: boolean;
  stream_path: string;
  ml_live_stream_path?: string;
  created_at?: string;
  updated_at?: string;
};

export type CameraWritePayload = {
  name: string;
  nvr: number;
  channel: number;
  zone?: string;
  purpose?: CameraPurpose;
  status?: string;
  is_active?: boolean;
};

export type CameraPurposeOption = { value: CameraPurpose; label: string };
export type NvrBrandOption = { value: NvrBrand; label: string };

export type DetectionEvent = {
  id: number;
  camera: number;
  camera_code: string;
<<<<<<< HEAD
  name: string;
  site_code: string;
  site_name: string;
  nvr_name: string;
  nvr_ip: string;
  channel: number;
  zone: string;
  purpose: CameraPurpose;
  purpose_label: string;
=======
  camera_name: string;
  site_code?: string;
  site_name?: string;
  nvr_name?: string;
  channel?: number;
  zone?: string;
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
  class_name: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  is_alert: boolean;
  created_at: string;
};

export type DetectionSummary = {
  detections_today: number;
  classes_tracked: number;
  alerts_today: number;
};

<<<<<<< HEAD
=======
export type DetectionEventsPage = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: DetectionEvent[];
};

export type DetectionEventsQuery = {
  page?: number;
  page_size?: number;
  camera?: number;
  site?: string;
  site_id?: number;
  nvr?: number;
  channel?: number;
  zone?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
  is_alert?: boolean;
  class_name?: string;
};

>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
export type StreamCameraMeta = {
  id: number;
  code: string;
  label: string;
  location: string;
  site_label: string;
  site_code: string;
  nvr_name: string;
  channel: number;
  purpose: CameraPurpose;
  purpose_label: string;
  ml_enabled: boolean;
  is_rtsp: boolean;
  stream_path: string;
  ml_live_stream_path?: string;
};

<<<<<<< HEAD
const API = apiUrl("");
=======
const API = `${API_BASE_URL}/api`;
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68

function parseList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: T[] }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

function formatApiError(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    if ("detail" in err && typeof (err as { detail: unknown }).detail === "string") {
      return (err as { detail: string }).detail;
    }
    return Object.entries(err)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : String(v)}`)
      .join("; ");
  }
  return fallback;
}

export function getCameraMjpegUrl(streamPath: string): string {
<<<<<<< HEAD
  const path = streamPath.startsWith("/") ? streamPath : `/${streamPath}`;
  const token = getStoredToken();
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${resolveApiUrl(path)}${qs}`;
=======
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = streamPath.startsWith("/") ? streamPath : `/${streamPath}`;
  const token = getStoredToken();
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${base}${path}${qs}`;
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
}

export function getMlLiveMjpegUrl(camera: Pick<CameraRecord, "ml_live_stream_path">): string | null {
  const path = (camera.ml_live_stream_path || "").trim();
  if (!path) return null;
  return getCameraMjpegUrl(path);
}

export function getPreviewMjpegUrl(nvrId: number, channel: number): string {
<<<<<<< HEAD
  const token = getStoredToken();
  const params = new URLSearchParams({ nvr_id: String(nvrId), channel: String(channel) });
  if (token) params.set("token", token);
  return `${apiUrl("cameras/preview/mjpeg/")}?${params}`;
=======
  const base = API_BASE_URL.replace(/\/$/, "");
  const token = getStoredToken();
  const params = new URLSearchParams({ nvr_id: String(nvrId), channel: String(channel) });
  if (token) params.set("token", token);
  return `${base}/api/cameras/preview/mjpeg/?${params}`;
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
}

// ——— Sites ———

export async function fetchSites(): Promise<SiteRecord[]> {
  const res = await fetch(`${API}/sites/`, { headers: getAuthHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sites (${res.status})`);
  return parseList<SiteRecord>(await res.json());
}

export async function createSite(payload: SiteWritePayload): Promise<SiteRecord> {
  const res = await fetch(`${API}/sites/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_active: true, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data, "Failed to create site"));
  return data;
}

export async function updateSite(id: number, payload: Partial<SiteWritePayload>): Promise<SiteRecord> {
  const res = await fetch(`${API}/sites/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update site (${res.status})`);
  return res.json();
}

export async function deleteSite(id: number): Promise<void> {
  const res = await fetch(`${API}/sites/${id}/`, { method: "DELETE", headers: getAuthHeaders() });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete site (${res.status})`);
}

// ——— NVRs ———

export async function fetchNvrs(siteId?: number): Promise<NvrRecord[]> {
  const qs = siteId != null ? `?site=${siteId}` : "";
  const res = await fetch(`${API}/nvrs/${qs}`, { headers: getAuthHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load NVRs (${res.status})`);
  return parseList<NvrRecord>(await res.json());
}

export async function fetchNvrBrands(): Promise<NvrBrandOption[]> {
  const res = await fetch(`${API}/nvrs/brands/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load NVR brands");
  return res.json();
}

export async function createNvr(payload: NvrWritePayload): Promise<NvrRecord> {
  const res = await fetch(`${API}/nvrs/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ port: 554, username: "admin", brand: "hikvision", is_active: true, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data, "Failed to create NVR"));
  return data;
}

export async function updateNvr(id: number, payload: Partial<NvrWritePayload>): Promise<NvrRecord> {
  const res = await fetch(`${API}/nvrs/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update NVR (${res.status})`);
  return res.json();
}

export async function deleteNvr(id: number): Promise<void> {
  const res = await fetch(`${API}/nvrs/${id}/`, { method: "DELETE", headers: getAuthHeaders() });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete NVR (${res.status})`);
}

export async function bulkCreateCameras(
  nvrId: number,
  payload: { channel_count: number; name_prefix?: string; zone?: string; purpose?: CameraPurpose }
): Promise<{ created: CameraRecord[]; skipped_channels: number[]; count: number }> {
  const res = await fetch(`${API}/nvrs/${nvrId}/bulk-cameras/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data, "Bulk camera creation failed"));
  return data;
}

// ——— Cameras ———

export async function fetchCamera(id: number): Promise<CameraRecord> {
  const res = await fetch(`${API}/cameras/${id}/`, { headers: getAuthHeaders(), cache: "no-store" });
  if (res.status === 404) throw new Error("Camera not found");
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`Failed to load camera (${res.status})`);
  return res.json();
}

export async function fetchCameras(params?: { nvr?: number; location?: string }): Promise<CameraRecord[]> {
  const search = new URLSearchParams();
  if (params?.nvr != null) search.set("nvr", String(params.nvr));
  if (params?.location) search.set("location", params.location);
  const qs = search.toString() ? `?${search}` : "";
  const res = await fetch(`${API}/cameras/${qs}`, { headers: getAuthHeaders(), cache: "no-store" });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`Failed to load cameras (${res.status})`);
  return parseList<CameraRecord>(await res.json());
}

export async function fetchCameraPurposes(): Promise<CameraPurposeOption[]> {
  const res = await fetch(`${API}/cameras/purposes/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load camera purposes");
  return res.json();
}

export async function createCamera(payload: CameraWritePayload): Promise<CameraRecord> {
  const res = await fetch(`${API}/cameras/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: "Online", is_active: true, zone: "", purpose: "surveillance", ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data, "Failed to create camera"));
  return data;
}

export async function updateCamera(id: number, payload: Partial<CameraWritePayload>): Promise<CameraRecord> {
  const res = await fetch(`${API}/cameras/${id}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update camera (${res.status})`);
  return res.json();
}

export async function deleteCamera(id: number): Promise<void> {
  const res = await fetch(`${API}/cameras/${id}/`, { method: "DELETE", headers: getAuthHeaders() });
  if (!res.ok && res.status !== 204) throw new Error(`Failed to delete camera (${res.status})`);
}

export async function fetchMlLiveDetections(cameraId: number): Promise<{
<<<<<<< HEAD
  camera_id: number;
  camera_code: string;
  name: string;
  site_code: string;
  site_name: string;
  nvr_name: string;
  nvr_ip: string;
  channel: number;
  zone: string;
  purpose: CameraPurpose;
  purpose_label: string;
=======
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
  detections: Array<{
    class_name: string;
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
    alert?: boolean;
  }>;
  count: number;
<<<<<<< HEAD
  saved_count: number;
=======
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
}> {
  const res = await fetch(`${API}/cameras/${cameraId}/ml-live/detections/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err, "ML live detections failed"));
  }
  return res.json();
}

export async function detectOnCamera(cameraId: number): Promise<{
  detections: Array<{
    class_name: string;
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
    alert?: boolean;
  }>;
  count: number;
}> {
  const res = await fetch(`${API}/cameras/${cameraId}/detect/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data, `Detection failed (${res.status})`));
  return data;
}

<<<<<<< HEAD
export type DetectionEventsPage = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied?: boolean;
  results: DetectionEvent[];
};

export type FetchDetectionEventsParams = {
  page?: number;
  pageSize?: number;
  cameraId?: number;
  siteCode?: string;
  nvrId?: number;
  channel?: number;
  zone?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export async function fetchDetectionEvents(
  params: FetchDetectionEventsParams = {}
): Promise<DetectionEventsPage> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 100;
  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (params.cameraId != null) searchParams.set("camera", String(params.cameraId));
  if (params.siteCode?.trim()) searchParams.set("site", params.siteCode.trim());
  if (params.nvrId != null) searchParams.set("nvr", String(params.nvrId));
  if (params.channel != null) searchParams.set("channel", String(params.channel));
  if (params.zone?.trim()) searchParams.set("zone", params.zone.trim());
  if (params.dateFrom?.trim()) searchParams.set("date_from", params.dateFrom.trim());
  if (params.dateTo?.trim()) searchParams.set("date_to", params.dateTo.trim());
  if (params.search?.trim()) searchParams.set("q", params.search.trim());
  const res = await fetch(`${API}/cameras/detection-events/?${searchParams}`, {
=======
export async function fetchDetectionEventsPage(
  query: DetectionEventsQuery = {}
): Promise<DetectionEventsPage> {
  const params = new URLSearchParams();
  if (query.page != null) params.set("page", String(query.page));
  if (query.page_size != null) params.set("page_size", String(query.page_size));
  if (query.camera != null) params.set("camera", String(query.camera));
  if (query.site) params.set("site", query.site);
  if (query.site_id != null) params.set("site_id", String(query.site_id));
  if (query.nvr != null) params.set("nvr", String(query.nvr));
  if (query.channel != null) params.set("channel", String(query.channel));
  if (query.zone) params.set("zone", query.zone);
  if (query.date_from) params.set("date_from", query.date_from);
  if (query.date_to) params.set("date_to", query.date_to);
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.class_name?.trim()) params.set("class_name", query.class_name.trim());
  if (query.is_alert === true) params.set("is_alert", "true");
  if (query.is_alert === false) params.set("is_alert", "false");

  const res = await fetch(`${API}/cameras/detection-events/?${params}`, {
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load detection events (${res.status})`);
  return res.json();
}

<<<<<<< HEAD
=======
/** @deprecated Use fetchDetectionEventsPage for server-side pagination and filters. */
export async function fetchDetectionEvents(limit = 50, cameraId?: number): Promise<DetectionEvent[]> {
  const page = await fetchDetectionEventsPage({
    page: 1,
    page_size: limit,
    camera: cameraId,
  });
  return page.results;
}

>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
export async function fetchDetectionSummary(): Promise<DetectionSummary> {
  const res = await fetch(`${API}/cameras/detection-summary/`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load detection summary");
  return res.json();
}

export async function fetchStreamCameras(): Promise<{
  cameras: StreamCameraMeta[];
  ffmpeg_available: boolean;
  ml_service_enabled: boolean;
}> {
  const res = await fetch(`${API}/cameras/streams/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load streams (${res.status})`);
  return res.json();
}

/** Display label for camera source (no credentials exposed). */
export function cameraSourceLabel(cam: Pick<CameraRecord, "site_name" | "nvr_name" | "channel" | "nvr_ip">): string {
  return `${cam.site_name} · ${cam.nvr_name} · Ch ${cam.channel}`;
}
