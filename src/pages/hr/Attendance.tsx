import { useEffect, useState } from "react"
import { Clock, LogIn, UserCheck, Calendar, Camera } from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CameraCapture } from "@/components/camera-capture"
import { useToast } from "@/hooks/use-toast"
import { getStoredUser } from "@/lib/auth"
import { fetchStaff, type StaffRecord } from "@/lib/staff-api"
import {
  fetchAttendance,
  markCheckIn,
  markCheckOut,
  recognizeAndMarkAttendance,
  getTodayRecordForUser,
  type AttendanceRecord,
} from "@/lib/attendance-api"
import { fetchMLHealth, type MLHealthResponse } from "@/lib/ml-api"

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return "—"
  }
}

function statusFromRecord(r: AttendanceRecord): string {
  if (r.check_in && r.check_out) return "Present"
  if (r.check_in) return "Present"
  return "Absent"
}

type MarkType = "check_in" | "check_out"
type MarkMode = "manual" | "face"

export default function AttendancePage() {
  const currentUser = getStoredUser()
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markType, setMarkType] = useState<MarkType>("check_in")
  const [markMode, setMarkMode] = useState<MarkMode>("face")
  const [mlHealth, setMlHealth] = useState<MLHealthResponse | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>(() =>
    String(getStoredUser()?.id ?? "")
  )
  const [cameraOpen, setCameraOpen] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [filterDate, setFilterDate] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const loadData = () => {
    setLoading(true)
    Promise.all([fetchAttendance(), fetchStaff()])
      .then(([attData, staffData]) => {
        setAttendance(attData)
        setStaff(staffData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    fetchMLHealth()
      .then(setMlHealth)
      .catch(() => setMlHealth({ status: "error", message: "Could not reach ML service." }))
  }, [])

  const todayStr = new Date().toISOString().slice(0, 10)
  const presentToday = attendance.filter((r) => r.check_in && r.date === todayStr).length
  const filteredAttendance = filterDate
    ? attendance.filter((r) => r.date === filterDate)
    : attendance
  const thisMonth = attendance.filter((r) => r.date?.startsWith(todayStr.slice(0, 7))).length

  const handleExport = () => {
    const rows = filteredAttendance.map((r) => ({
      date: r.date,
      username: r.username,
      check_in: r.check_in ?? "",
      check_out: r.check_out ?? "",
      status: statusFromRecord(r),
    }))
    const headers = ["Date", "Username", "Check-in", "Check-out", "Status"]
    const csv = [headers.join(","), ...rows.map((r) => [r.date, r.username, r.check_in, r.check_out, r.status].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `attendance-${filterDate || "all"}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const userIdNum = selectedUserId ? Number(selectedUserId) : currentUser?.id ?? 0
  const todayRecord = userIdNum ? getTodayRecordForUser(attendance, userIdNum) : undefined
  const canCheckOut = markType === "check_out" && todayRecord

  const handleFaceScan = (file: File) => {
    setMarkError(null)
    setMarking(true)
    recognizeAndMarkAttendance(file, { autoMark: true })
      .then((result) => {
        if (!result.recognized) {
          setMarkError(result.message ?? "Face not recognized.")
          return
        }
        setCameraOpen(false)
        loadData()
        const action =
          result.attendance === "check_in"
            ? "Check-in"
            : result.attendance === "check_out"
              ? "Check-out"
              : result.attendance === "already_complete"
                ? "Already complete for today"
                : "Recognized"
        toast({
          title: `${action}: ${result.username ?? "staff"}`,
          description: `Similarity ${(result.similarity * 100).toFixed(0)}%`,
        })
      })
      .catch((err) => setMarkError(err instanceof Error ? err.message : "Face recognition failed"))
      .finally(() => setMarking(false))
  }

  const handleMarkWithPhoto = (file: File) => {
    setMarkError(null)
    setMarking(true)
    if (markType === "check_in") {
      markCheckIn(userIdNum, file)
        .then(() => {
          setCameraOpen(false)
          loadData()
          toast({ title: "Check-in recorded", description: "Attendance marked successfully." })
        })
        .catch((err) => setMarkError(err instanceof Error ? err.message : "Failed to mark check-in"))
        .finally(() => setMarking(false))
    } else {
      if (!todayRecord) {
        setMarkError("No check-in record found for today. Mark check-in first.")
        setMarking(false)
        return
      }
      markCheckOut(todayRecord.id, file)
        .then(() => {
          setCameraOpen(false)
          loadData()
          toast({ title: "Check-out recorded", description: "Attendance updated successfully." })
        })
        .catch((err) => setMarkError(err instanceof Error ? err.message : "Failed to mark check-out"))
        .finally(() => setMarking(false))
    }
  }

  const staffOptions = [
    ...(currentUser ? [{ id: currentUser.id, label: `Me (${currentUser.username})` }] : []),
    ...staff
      .filter((s) => s.user != null && s.user !== currentUser?.id)
      .map((s) => ({ id: s.user!, label: `${s.full_name ?? "—"} — ${s.department ?? ""}` })),
  ]


  return (
    <ModulePageLayout
      title="Attendance"
      description="Track check-in/check-out and daily attendance records."
      breadcrumbs={[{ label: "HR" }, { label: "Attendance" }]}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present Today
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Checked in today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Attendance entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Late Today
              </CardTitle>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground mt-1">After 09:15</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full min-w-0">
          <CardHeader>
            <CardTitle>Mark attendance (camera)</CardTitle>
            <CardDescription>
              Use face scan (ML) for automatic check-in/out, or manual mode to pick staff and mark with a photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 w-full min-w-0">
            {mlHealth && (
              <p className="text-xs text-muted-foreground">
                ML:{" "}
                {mlHealth.status === "ok"
                  ? `connected — ${mlHealth.known_faces ?? 0} known face(s)${mlHealth.yolo_available ? ", YOLO ready" : ", YOLO weights missing"}`
                  : mlHealth.message ?? mlHealth.status}
              </p>
            )}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={markMode === "face" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkMode("face")}
                  >
                    Face scan
                  </Button>
                  <Button
                    type="button"
                    variant={markMode === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkMode("manual")}
                  >
                    Manual
                  </Button>
                </div>
              </div>
              {markMode === "manual" && (
                <>
                  <div className="space-y-2">
                    <Label>Staff</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="w-full sm:w-56">
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffOptions.map((opt) => (
                          <SelectItem key={opt.id} value={String(opt.id)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={markType === "check_in" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMarkType("check_in")}
                      >
                        Check-in
                      </Button>
                      <Button
                        type="button"
                        variant={markType === "check_out" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMarkType("check_out")}
                      >
                        Check-out
                      </Button>
                    </div>
                  </div>
                </>
              )}
              <Button
                className="w-full bg-[#3b82f6] text-white hover:bg-[#2563eb] sm:w-auto"
                disabled={
                  markMode === "manual" &&
                  (!userIdNum || (markType === "check_out" && !todayRecord))
                }
                onClick={() => {
                  setMarkError(null)
                  setCameraOpen(true)
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {markMode === "face" ? "Open camera & scan face" : "Open camera & mark"}
              </Button>
            </div>
            {markMode === "manual" && markType === "check_out" && !todayRecord && selectedUserId && (
              <p className="text-sm text-amber-600">No check-in found for today. Mark check-in first.</p>
            )}
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
              <DialogContent className="w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {markMode === "face"
                      ? "Face scan — auto check-in/out"
                      : `${markType === "check_in" ? "Check-in" : "Check-out"} — capture photo`}
                  </DialogTitle>
                </DialogHeader>
                {markError && (
                  <p className="text-sm text-destructive">{markError}</p>
                )}
                <CameraCapture
                  title={markMode === "face" ? "Scan face for attendance" : "Capture attendance photo"}
                  description={
                    markMode === "face"
                      ? "Look at the camera. The system will recognize staff and mark check-in or check-out automatically."
                      : "Position the staff member in frame and capture. The photo will be saved with the attendance record."
                  }
                  onCapture={markMode === "face" ? handleFaceScan : handleMarkWithPhoto}
                  onCancel={() => setCameraOpen(false)}
                />
                {marking && <p className="text-sm text-muted-foreground">Saving…</p>}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="w-full min-w-0">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <CardTitle>Today&apos;s Attendance</CardTitle>
              <CardDescription>Check-in and check-out log for current day</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Input
                type="date"
                className="w-full sm:w-40"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground py-8">Loading attendance…</p>
            ) : (
            <div className="w-full max-w-full overflow-x-auto rounded-lg border pb-2">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {attendance.length === 0
                        ? "No attendance records yet."
                        : `No records for ${filterDate}. Change the date or export all.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance.map((row) => {
                    const status = statusFromRecord(row)
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
                        <TableCell className="font-medium">{row.username}</TableCell>
                        <TableCell>{formatTime(row.check_in)}</TableCell>
                        <TableCell>{formatTime(row.check_out)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "Present" ? "default" : "outline"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
