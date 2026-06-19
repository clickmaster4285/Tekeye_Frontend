import { useEffect, useState } from "react"
import { Scan, Package, AlertTriangle } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MlSystemStatus } from "@/components/cameras/ml-system-status"
import {
  fetchDetectionEvents,
  fetchDetectionSummary,
  type DetectionEvent,
  type DetectionSummary,
} from "@/lib/cameras-api"

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return iso
  }
}

export default function ObjectDetectionPage() {
  const [summary, setSummary] = useState<DetectionSummary | null>(null)
  const [events, setEvents] = useState<DetectionEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([fetchDetectionSummary(), fetchDetectionEvents(50)])
      .then(([s, e]) => {
        setSummary(s)
        setEvents(e)
      })
      .catch(() => {
        setSummary({ detections_today: 0, classes_tracked: 0, alerts_today: 0 })
        setEvents([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 15000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <ModulePageLayout
      title="Object Detection"
      description="Live YOLO detections from cameras with Object Detection or related AI purposes."
      breadcrumbs={[{ label: "WMS" }, { label: "Object Detection" }]}
    >
      <div className="grid gap-6">
        <MlSystemStatus />
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Detections Today</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.detections_today ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all ML cameras</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Tracked</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.classes_tracked ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique object types today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.alerts_today ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Alert-class detections</p>
            </CardContent>
          </Card>
        </div>
        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Detection Log</CardTitle>
              <CardDescription>Recent events from camera ML scans (auto-refreshes)</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="w-full min-w-0 space-y-3">
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {loading
                          ? "Loading…"
                          : "No detections yet. Assign an AI purpose to cameras and open live feeds."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{formatTime(row.created_at)}</TableCell>
                        <TableCell>{row.camera_code}</TableCell>
                        <TableCell>{row.class_name}</TableCell>
                        <TableCell>{row.label}</TableCell>
                        <TableCell>{(row.confidence * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Badge variant={row.is_alert ? "destructive" : "outline"}>
                            {row.is_alert ? "Alert" : "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
