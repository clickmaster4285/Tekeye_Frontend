import { API_BASE_URL } from "@/lib/api"
import type { MemoDistributionRecord } from "@/lib/memo-distribution-api"

export function videoUrlForEntry(entry: { url?: string; path?: string }): string | null {
  if (entry.url) return entry.url
  if (entry.path) return `${API_BASE_URL}/media/${entry.path.replace(/^\/+/, "")}`
  return null
}

export function recordingEntries(record: MemoDistributionRecord) {
  const fromApi = record.cameraVideoEntries.filter((entry) => videoUrlForEntry(entry))
  if (fromApi.length > 0) return fromApi
  const entries = record.cameraVideos
    .map((entry) => ({
      ...entry,
      url: videoUrlForEntry(entry) || undefined,
    }))
    .filter((entry) => entry.url)
  if (entries.length > 0) return entries
  if (record.videoUrl) {
    return [
      {
        camera_id: record.camera ?? 0,
        filename: "recording.mp4",
        url: record.videoUrl,
      },
    ]
  }
  return []
}

export function outcomeLabel(outcome: MemoDistributionRecord["outcome"], status?: string): string {
  if (outcome === "inventory_deducted") return "Inventory deducted"
  if (outcome === "destructed") return "Destructed"
  return status || "—"
}

export function filterDestructionRecords(
  records: MemoDistributionRecord[],
  opts?: { qrCode?: string; caseNo?: string }
): MemoDistributionRecord[] {
  const qr = (opts?.qrCode || "").trim().toLowerCase()
  const caseNo = (opts?.caseNo || "").trim().toLowerCase()
  return records.filter((record) => {
    if (caseNo && !(record.detentionCaseNo || "").toLowerCase().includes(caseNo)) return false
    if (!qr) return true
    const itemHit = record.selectedItems.some((item) => (item.qr_code || "").toLowerCase() === qr)
    const deductHit = record.inventoryDeductions.some((d) => (d.qr_code || "").toLowerCase() === qr)
    return itemHit || deductHit
  })
}

export function destructionSummary(records: MemoDistributionRecord[]) {
  const completed = records.filter((r) => r.status === "completed")
  const itemsDestroyed = completed.reduce((sum, r) => sum + r.selectedItems.length, 0)
  const fireSessions = completed.filter((r) => r.smokeFireDetected).length
  const videos = completed.reduce((sum, r) => sum + recordingEntries(r).length, 0)
  return {
    totalSessions: records.length,
    completedSessions: completed.length,
    itemsDestroyed,
    fireSessions,
    videoCount: videos,
  }
}
