import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { fetchMLHealth } from "@/lib/ml-api"
import { fetchStreamCameras } from "@/lib/cameras-api"

export function MlSystemStatus({ className = "" }: { className?: string }) {
  const [ml, setMl] = useState<string>("checking…")
  const [cameras, setCameras] = useState<string>("")

  useEffect(() => {
    Promise.all([
      fetchMLHealth().catch(() => ({ status: "error" as const })),
      fetchStreamCameras().catch(() => null),
    ]).then(([health, streams]) => {
      if (health.status === "ok") {
        setMl(
          `ML online — ${health.known_faces ?? 0} faces, YOLO ${health.yolo_available ? "ready" : "missing weights"}`
        )
      } else {
        setMl(health.message ?? "ML starting… restart backend if this persists")
      }
      if (streams) {
        const active = streams.cameras.length
        setCameras(`${active} camera(s) · ffmpeg ${streams.ffmpeg_available ? "ok" : "missing"}`)
      }
    })
  }, [])

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <Badge variant="outline">{ml}</Badge>
      {cameras && <Badge variant="outline">{cameras}</Badge>}
    </div>
  )
}
