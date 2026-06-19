import { useCallback, useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  fetchMlLiveDetections,
  getCameraMjpegUrl,
  getMlLiveMjpegUrl,
  cameraSourceLabel,
  type CameraRecord,
} from "@/lib/cameras-api"
import { cn } from "@/lib/utils"

type DetectionBox = {
  class_name?: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
  alert?: boolean
}

type MlCameraFeedProps = {
  camera: CameraRecord
  showOverlay?: boolean
  pollMl?: boolean
  pollIntervalMs?: number
  className?: string
  showBrandLogo?: boolean
  showFullscreenButton?: boolean
  onDetections?: (boxes: DetectionBox[]) => void
  onMlError?: (message: string) => void
  onScanStart?: () => void
}

const TEKEYE_LOGO_SRC = "/pakistan-customs-logo.png"
const ML_UPGRADE_DELAY_MS = 2500
const MAX_STREAM_RETRIES = 4
const STREAM_RETRY_MS = 1500

function StreamBrandMarks() {
  return (
    <>
      <div
        className="absolute bottom-3 left-3 z-10 rounded-lg border border-white/10 bg-black/50 px-3 py-2 pointer-events-none backdrop-blur-sm"
        aria-hidden
      >
        <img
          src={TEKEYE_LOGO_SRC}
          alt="Pakistan Customs"
          className="h-12 w-auto max-w-[180px] object-contain sm:h-14"
        />
      </div>
      <div
        className="absolute bottom-3 right-3 z-10 rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 pointer-events-none backdrop-blur-sm"
        aria-hidden
      >
        <span className="text-xl font-extrabold uppercase tracking-[0.16em] text-white sm:text-2xl">
          TekEye
        </span>
      </div>
    </>
  )
}

export function MlCameraFeed({
  camera,
  pollMl = true,
  pollIntervalMs = 2000,
  className = "",
  showBrandLogo = true,
  showFullscreenButton = false,
  onDetections,
  onMlError,
  onScanStart,
}: MlCameraFeedProps) {
  const [mlError, setMlError] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [streamRetry, setStreamRetry] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [usingMlStream, setUsingMlStream] = useState(false)
  const mlUpgradeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mlSrc = getMlLiveMjpegUrl(camera)
  const rawSrc =
    camera.is_rtsp && camera.stream_path ? getCameraMjpegUrl(camera.stream_path) : null
  const displaySrc = usingMlStream && mlSrc ? mlSrc : rawSrc || mlSrc

  const exitFullscreen = useCallback(() => setIsFullscreen(false), [])

  useEffect(() => {
    setUsingMlStream(false)
    setStreamError(null)
    setStreamRetry(0)
    if (mlUpgradeTimer.current) {
      clearTimeout(mlUpgradeTimer.current)
      mlUpgradeTimer.current = null
    }
    if (!pollMl || !mlSrc || !rawSrc) return
    mlUpgradeTimer.current = setTimeout(() => setUsingMlStream(true), ML_UPGRADE_DELAY_MS)
    return () => {
      if (mlUpgradeTimer.current) clearTimeout(mlUpgradeTimer.current)
    }
  }, [camera.id, mlSrc, rawSrc, pollMl])

  useEffect(() => {
    if (!pollMl || !mlSrc) return
    let cancelled = false

    const run = async () => {
      onScanStart?.()
      try {
        const result = await fetchMlLiveDetections(camera.id)
        if (cancelled) return
        const next = (result.detections || []).map((d) => ({
          class_name: d.class_name,
          label: d.label,
          confidence: d.confidence,
          bbox: d.bbox,
          alert: d.alert,
        }))
        setMlError(null)
        onDetections?.(next)
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "ML detection failed"
          setMlError(msg)
          onMlError?.(msg)
        }
      }
    }

    void run()
    const id = window.setInterval(run, pollIntervalMs)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [camera.id, mlSrc, pollMl, pollIntervalMs, onDetections, onMlError, onScanStart])

  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [isFullscreen, exitFullscreen])

  const handleStreamError = () => {
    if (usingMlStream && rawSrc) {
      setUsingMlStream(false)
      setStreamError(null)
      return
    }
    if (streamRetry < MAX_STREAM_RETRIES) {
      window.setTimeout(() => setStreamRetry((n) => n + 1), STREAM_RETRY_MS)
      return
    }
    setStreamError(
      usingMlStream
        ? "ML stream unavailable — showing raw feed or check ML service."
        : "Cannot load stream — verify NVR credentials, channel, and ffmpeg."
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black/90",
        isFullscreen
          ? "fixed inset-0 z-[200] flex flex-col"
          : cn("aspect-video", className)
      )}
    >
      <div className={cn("relative flex-1 min-h-0 w-full", isFullscreen && "h-full")}>
        {displaySrc ? (
          <img
            key={`${displaySrc}-${streamRetry}`}
            src={displaySrc}
            alt={camera.name}
            className="h-full w-full object-contain"
            onLoad={() => setStreamError(null)}
            onError={handleStreamError}
          />
        ) : (
          <div className="flex h-full min-h-[120px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Configure an NVR channel for this camera in Camera Management.
          </div>
        )}

        <div className="absolute top-2 left-2 z-10 flex max-w-[70%] flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {camera.name}
          </Badge>
          {usingMlStream && mlSrc ? (
            <Badge className="bg-[#3b82f6] text-xs">ML live</Badge>
          ) : rawSrc ? (
            <Badge variant="outline" className="text-xs text-white border-white/30">
              Live
            </Badge>
          ) : null}
          <Badge className="bg-[#3b82f6]/80 text-xs">{camera.purpose_label}</Badge>
        </div>

        {showFullscreenButton && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-20 h-8 w-8 bg-black/55 text-white hover:bg-black/75 hover:text-white"
            onClick={() => (isFullscreen ? exitFullscreen() : setIsFullscreen(true))}
            title={isFullscreen ? "Exit full screen (Esc)" : "View full screen"}
            aria-label={isFullscreen ? "Exit full screen" : "View full screen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}

        {showBrandLogo && <StreamBrandMarks />}

        {(streamError || mlError) && (
          <p className="absolute bottom-10 left-1 right-1 z-10 truncate rounded bg-black/60 px-1 text-[10px] text-amber-300">
            {streamError || mlError}
          </p>
        )}
      </div>

      {isFullscreen && (
        <div className="shrink-0 border-t border-white/10 bg-black/90 px-4 py-2 text-center text-xs text-white/80">
          {camera.name}
          {" · "}
          {cameraSourceLabel(camera)}
          {" · "}
          Press Esc or tap minimize to exit
        </div>
      )}
    </div>
  )
}
