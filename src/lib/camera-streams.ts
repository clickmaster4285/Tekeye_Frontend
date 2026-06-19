/** @deprecated Use @/lib/cameras-api */
export {
  fetchStreamCameras as fetchDashboardCameras,
  getCameraMjpegUrl,
  type StreamCameraMeta as DashboardCamera,
} from "@/lib/cameras-api"

export type CameraStreamListResponse = {
  cameras: import("@/lib/cameras-api").StreamCameraMeta[]
  ffmpeg_available: boolean
  ml_service_enabled?: boolean
}
