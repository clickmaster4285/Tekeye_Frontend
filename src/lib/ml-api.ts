<<<<<<< HEAD
import { apiUrl, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";
=======
import { API_BASE_URL, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68

export type MLHealthResponse = {
  status: "ok" | "disabled" | "error";
  message?: string;
  yolo_available?: boolean;
  yolo_weights?: string | null;
  known_faces?: number;
  known_faces_dir?: string;
};

export type MLDetection = {
  class_id: number;
  class_name: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  alert?: boolean;
};

export async function fetchMLHealth(): Promise<MLHealthResponse> {
<<<<<<< HEAD
  const response = await fetch(apiUrl("ml/health/"), {
=======
  const response = await fetch(`${API_BASE_URL}/api/ml/health/`, {
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error("Unauthorized");
  return data as MLHealthResponse;
}

export async function detectImage(
  imageFile: File,
  options?: { conf?: number; recognizeFaces?: boolean }
): Promise<{ detections: MLDetection[]; count: number }> {
  const form = new FormData();
  form.append("image", imageFile);
  const params = new URLSearchParams();
  if (options?.conf != null) params.set("conf", String(options.conf));
<<<<<<< HEAD
  const url = `${apiUrl("ml/detect/")}${params.toString() ? `?${params}` : ""}`;
=======
  const url = `${API_BASE_URL}/api/ml/detect/${params.toString() ? `?${params}` : ""}`;
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeadersFormData(),
    body: form,
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(typeof err?.detail === "string" ? err.detail : `Detection failed (${response.status})`);
  }
  return response.json();
}

export async function reloadKnownFaces(): Promise<{ reloaded: boolean; known_faces: number }> {
<<<<<<< HEAD
  const response = await fetch(apiUrl("ml/reload-faces/"), {
=======
  const response = await fetch(`${API_BASE_URL}/api/ml/reload-faces/`, {
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Failed to reload faces (${response.status})`);
  return response.json();
}
