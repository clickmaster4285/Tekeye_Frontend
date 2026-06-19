import { API_BASE_URL, getAuthHeaders, getAuthHeadersFormData } from "@/lib/api";

export type AttendanceRecord = {
  id: number;
  user: number;
  username: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  image: string | null;
  source?: string;
};

const ATTENDANCE_ENDPOINT = `${API_BASE_URL}/api/attendance/`;

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const response = await fetch(ATTENDANCE_ENDPOINT, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Failed to load attendance (${response.status})`);
  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { results?: AttendanceRecord[] }).results))
    return (data as { results: AttendanceRecord[] }).results;
  return [];
}

/** Mark check-in with camera image. */
export async function markCheckIn(userId: number, imageFile: File): Promise<AttendanceRecord> {
  const form = new FormData();
  form.append("user", String(userId));
  form.append("image", imageFile);
  const response = await fetch(ATTENDANCE_ENDPOINT, {
    method: "POST",
    headers: getAuthHeadersFormData(),
    body: form,
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 403) throw new Error("Only Admin or HR can mark attendance.");
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg =
      typeof err === "object" && err !== null
        ? Object.entries(err)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
            .join("; ")
        : `Failed to mark check-in (${response.status})`;
    throw new Error(msg);
  }
  return response.json();
}

/** Mark check-out. */
export async function markCheckOut(recordId: number, imageFile?: File): Promise<AttendanceRecord> {
  const url = `${ATTENDANCE_ENDPOINT}${recordId}/`;
  const checkOutIso = new Date().toISOString();
  if (imageFile) {
    const form = new FormData();
    form.append("check_out", checkOutIso);
    form.append("image", imageFile);
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeadersFormData(),
      body: form,
    });
    if (response.status === 401) throw new Error("Unauthorized");
    if (!response.ok) throw new Error(`Failed to mark check-out (${response.status})`);
    return response.json();
  }
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ check_out: checkOutIso }),
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Failed to mark check-out (${response.status})`);
  return response.json();
}

export function getTodayRecordForUser(
  records: AttendanceRecord[],
  userId: number
): AttendanceRecord | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return records.find((r) => r.user === userId && r.date === today);
}

export type RecognizeResponse =
  | { recognized: false; message: string }
  | {
      recognized: true;
      user_id: number;
      username?: string;
      similarity: number;
      attendance?: string;
      record_id?: number;
    };

export async function recognizeAndMarkAttendance(
  imageFile: File,
  options?: { autoMark?: boolean; threshold?: number }
): Promise<RecognizeResponse> {
  const form = new FormData();
  form.append("image", imageFile);
  form.append("auto_mark", options?.autoMark !== false ? "true" : "false");
  if (options?.threshold != null) form.append("threshold", String(options.threshold));
  const response = await fetch(`${API_BASE_URL}/api/attendance/recognize/`, {
    method: "POST",
    headers: getAuthHeadersFormData(),
    body: form,
  });
  if (response.status === 401) throw new Error("Unauthorized");
  if (response.status === 503)
    throw new Error("Face recognition not available. Install backend dependencies and train the model.");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = typeof data?.error === "string" ? data.error : `Recognition failed (${response.status})`;
    throw new Error(msg);
  }
  return data as RecognizeResponse;
}
