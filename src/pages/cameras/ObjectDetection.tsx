<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
=======
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
import {
  Scan,
  Package,
  AlertTriangle,
<<<<<<< HEAD
  MapPin,
  Server,
  Video,
  Search,
  Loader2,
  FilterX,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
=======
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Flame,
  Camera,
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
} from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
<<<<<<< HEAD
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
=======
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MlSystemStatus } from "@/components/cameras/ml-system-status"
<<<<<<< HEAD
import { cn } from "@/lib/utils"
import {
  fetchCameras,
  fetchDetectionEvents,
  fetchDetectionSummary,
  fetchNvrs,
  fetchSites,
  type CameraRecord,
  type DetectionEvent,
  type DetectionSummary,
  type FetchDetectionEventsParams,
  type NvrRecord,
  type SiteRecord,
} from "@/lib/cameras-api"

const PAGE_SIZE = 100
const ALL = "all"

function formatTime(iso: string): string {
=======
import {
  fetchDetectionEventsPage,
  fetchDetectionSummary,
  fetchCameras,
  fetchSites,
  type DetectionEventsQuery,
} from "@/lib/cameras-api"

const PAGE_SIZE = 100

type AppliedFilters = {
  q: string
  site: string
  camera: string
  date_from: string
  date_to: string
  alert: "all" | "alerts" | "normal"
  class_name: string
}

const emptyFilters: AppliedFilters = {
  q: "",
  site: "all",
  camera: "all",
  date_from: "",
  date_to: "",
  alert: "all",
  class_name: "",
}

function formatDateTime(iso: string): string {
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
<<<<<<< HEAD
=======
      year: "numeric",
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

<<<<<<< HEAD
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex min-w-[72px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-[#3b82f6]" : "bg-amber-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  )
}

function DetectionRow({ row }: { row: DetectionEvent }) {
  return (
    <TableRow
      className={cn(
        "transition-colors hover:bg-muted/50",
        row.is_alert && "bg-amber-50/60 dark:bg-amber-950/15"
      )}
    >
      <TableCell className="whitespace-nowrap font-medium text-sm">{formatTime(row.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3b82f6]" />
          <div className="min-w-0">
            <div className="truncate font-medium text-sm">{row.site_name || "—"}</div>
            <div className="text-[11px] text-muted-foreground">{row.site_code}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-2">
          <Server className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="truncate font-medium text-sm">{row.nvr_name || "—"}</div>
            <div className="truncate font-mono text-[11px] text-muted-foreground">{row.nvr_ip}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono text-xs">
          CH {row.channel}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-2">
          <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="truncate font-medium text-sm">{row.name}</div>
            <div className="text-[11px] text-muted-foreground">{row.camera_code}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{row.zone || "—"}</TableCell>
      <TableCell>
        <Badge className="bg-[#3b82f6]/90 text-[11px]">{row.purpose_label}</Badge>
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.class_name}</code>
      </TableCell>
      <TableCell className="font-medium text-sm">{row.label}</TableCell>
      <TableCell>
        <ConfidenceBar value={row.confidence} />
      </TableCell>
      <TableCell>
        <Badge variant={row.is_alert ? "destructive" : "secondary"} className="text-[11px]">
          {row.is_alert ? "Alert" : "Normal"}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  title: string
  value: string | number
  hint: string
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", accent)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ObjectDetectionPage() {
  const [summary, setSummary] = useState<DetectionSummary | null>(null)
  const [events, setEvents] = useState<DetectionEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersAppliedOnServer, setFiltersAppliedOnServer] = useState(false)
  const [sites, setSites] = useState<SiteRecord[]>([])
  const [nvrs, setNvrs] = useState<NvrRecord[]>([])
  const [allCameras, setAllCameras] = useState<CameraRecord[]>([])

  const [siteFilter, setSiteFilter] = useState(ALL)
  const [nvrFilter, setNvrFilter] = useState(ALL)
  const [cameraFilter, setCameraFilter] = useState(ALL)
  const [channelFilter, setChannelFilter] = useState(ALL)
  const [zoneFilter, setZoneFilter] = useState(ALL)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => window.clearTimeout(id)
  }, [searchQuery])

  const filteredNvrs = useMemo(() => {
    if (siteFilter === ALL) return nvrs
    const site = sites.find((s) => s.code === siteFilter)
    if (!site) return nvrs
    return nvrs.filter((n) => n.site === site.id)
  }, [nvrs, siteFilter, sites])

  const channelOptions = useMemo(() => {
    const source =
      cameraFilter !== ALL
        ? allCameras.filter((c) => String(c.id) === cameraFilter)
        : nvrFilter !== ALL
          ? allCameras.filter((c) => String(c.nvr) === nvrFilter)
          : siteFilter !== ALL
            ? allCameras.filter((c) => c.site_code === siteFilter)
            : allCameras
    return [...new Set(source.map((c) => c.channel))].sort((a, b) => a - b)
  }, [allCameras, cameraFilter, nvrFilter, siteFilter])

  const zoneOptions = useMemo(() => {
    const source =
      cameraFilter !== ALL
        ? allCameras.filter((c) => String(c.id) === cameraFilter)
        : nvrFilter !== ALL
          ? allCameras.filter((c) => String(c.nvr) === nvrFilter)
          : siteFilter !== ALL
            ? allCameras.filter((c) => c.site_code === siteFilter)
            : allCameras
    return [...new Set(source.map((c) => c.zone).filter(Boolean))].sort()
  }, [allCameras, cameraFilter, nvrFilter, siteFilter])

  const cameraOptions = useMemo(() => {
    let list = allCameras
    if (nvrFilter !== ALL) list = list.filter((c) => String(c.nvr) === nvrFilter)
    else if (siteFilter !== ALL) list = list.filter((c) => c.site_code === siteFilter)
    if (channelFilter !== ALL) list = list.filter((c) => String(c.channel) === channelFilter)
    if (zoneFilter !== ALL) list = list.filter((c) => c.zone === zoneFilter)
    return list
  }, [allCameras, nvrFilter, siteFilter, channelFilter, zoneFilter])

  const queryParams = useMemo((): FetchDetectionEventsParams => {
    const params: FetchDetectionEventsParams = {
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }
    if (siteFilter !== ALL) params.siteCode = siteFilter
    if (nvrFilter !== ALL) params.nvrId = Number(nvrFilter)
    if (cameraFilter !== ALL) params.cameraId = Number(cameraFilter)
    else if (channelFilter !== ALL) params.channel = Number(channelFilter)
    if (zoneFilter !== ALL) params.zone = zoneFilter
    return params
  }, [siteFilter, nvrFilter, cameraFilter, channelFilter, zoneFilter, dateFrom, dateTo, debouncedSearch])

  const hasActiveFilters =
    siteFilter !== ALL ||
    nvrFilter !== ALL ||
    cameraFilter !== ALL ||
    channelFilter !== ALL ||
    zoneFilter !== ALL ||
    dateFrom !== "" ||
    dateTo !== "" ||
    debouncedSearch !== ""

  const activeFilterChips = useMemo(() => {
    const chips: string[] = []
    if (debouncedSearch) chips.push(`Class/label: ${debouncedSearch}`)
    if (siteFilter !== ALL) chips.push(`Site: ${siteFilter}`)
    if (nvrFilter !== ALL) {
      const nvr = nvrs.find((n) => String(n.id) === nvrFilter)
      chips.push(`NVR: ${nvr?.name ?? nvrFilter}`)
    }
    if (cameraFilter !== ALL) {
      const cam = allCameras.find((c) => String(c.id) === cameraFilter)
      chips.push(`Camera: ${cam?.name ?? cameraFilter}`)
    }
    if (channelFilter !== ALL) chips.push(`Channel: ${channelFilter}`)
    if (zoneFilter !== ALL) chips.push(`Zone: ${zoneFilter}`)
    if (dateFrom) chips.push(`From: ${dateFrom}`)
    if (dateTo) chips.push(`To: ${dateTo}`)
    return chips
  }, [
    debouncedSearch,
    siteFilter,
    nvrFilter,
    cameraFilter,
    channelFilter,
    zoneFilter,
    dateFrom,
    dateTo,
    nvrs,
    allCameras,
  ])

  const loadSummary = useCallback(() => {
    fetchDetectionSummary()
      .then(setSummary)
      .catch(() => setSummary({ detections_today: 0, classes_tracked: 0, alerts_today: 0 }))
  }, [])

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true)
      try {
        const data = await fetchDetectionEvents({ ...queryParams, page: pageNum })
        setEvents(data.results)
        setTotalCount(data.count)
        setTotalPages(data.total_pages)
        setCurrentPage(data.page)
        setFiltersAppliedOnServer(Boolean(data.filters_applied))
      } catch {
        setEvents([])
        setTotalCount(0)
        setTotalPages(0)
        setCurrentPage(1)
        setFiltersAppliedOnServer(false)
      } finally {
        setLoading(false)
      }
    },
    [queryParams]
  )

  const goToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage || loading) return
    void fetchPage(pageNum)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    setSiteFilter(ALL)
    setNvrFilter(ALL)
    setCameraFilter(ALL)
    setChannelFilter(ALL)
    setZoneFilter(ALL)
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
  }

  const handleSiteChange = (value: string) => {
    setSiteFilter(value)
    setNvrFilter(ALL)
    setCameraFilter(ALL)
    setChannelFilter(ALL)
    setZoneFilter(ALL)
  }

  const handleNvrChange = (value: string) => {
    setNvrFilter(value)
    setCameraFilter(ALL)
    setChannelFilter(ALL)
    setZoneFilter(ALL)
  }

  useEffect(() => {
    Promise.all([fetchSites(), fetchNvrs(), fetchCameras()])
      .then(([s, n, c]) => {
        setSites(s)
        setNvrs(n)
        setAllCameras(c)
      })
      .catch(() => {
        setSites([])
        setNvrs([])
        setAllCameras([])
      })
  }, [])

  useEffect(() => {
    loadSummary()
    const id = window.setInterval(loadSummary, 60000)
    return () => window.clearInterval(id)
  }, [loadSummary])

  useEffect(() => {
    setCurrentPage(1)
    void fetchPage(1)
  }, [fetchPage])

  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalCount)

  const emptyMessage = debouncedSearch
    ? `No detections match class/label "${debouncedSearch}" across the database.`
    : hasActiveFilters
      ? "No detections match your filters across the full database."
      : "No saved detections yet. Open live camera feeds with ML enabled to record readings."
=======
function confidenceTone(confidence: number): string {
  if (confidence >= 0.85) return "bg-emerald-500"
  if (confidence >= 0.6) return "bg-amber-500"
  return "bg-orange-500"
}

function buildQuery(page: number, filters: AppliedFilters): DetectionEventsQuery {
  const query: DetectionEventsQuery = {
    page,
    page_size: PAGE_SIZE,
  }
  if (filters.q.trim()) query.q = filters.q.trim()
  if (filters.site !== "all") query.site = filters.site
  if (filters.camera !== "all") query.camera = Number(filters.camera)
  if (filters.date_from) query.date_from = filters.date_from
  if (filters.date_to) query.date_to = filters.date_to
  if (filters.class_name.trim()) query.class_name = filters.class_name.trim()
  if (filters.alert === "alerts") query.is_alert = true
  if (filters.alert === "normal") query.is_alert = false
  return query
}

export default function ObjectDetectionPage() {
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<AppliedFilters>(emptyFilters)
  const [applied, setApplied] = useState<AppliedFilters>(emptyFilters)

  const { data: summary } = useQuery({
    queryKey: ["detection-summary"],
    queryFn: fetchDetectionSummary,
    refetchInterval: 15000,
  })

  const { data: sites = [] } = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  })

  const { data: cameras = [] } = useQuery({
    queryKey: ["cameras"],
    queryFn: () => fetchCameras(),
  })

  const queryParams = useMemo(() => buildQuery(page, applied), [page, applied])

  const {
    data: eventsPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["detection-events", queryParams],
    queryFn: () => fetchDetectionEventsPage(queryParams),
    placeholderData: (prev) => prev,
  })

  const events = eventsPage?.results ?? []
  const totalCount = eventsPage?.count ?? 0
  const totalPages = eventsPage?.total_pages ?? 0

  const siteCameras = useMemo(() => {
    if (draft.site === "all") return cameras
    return cameras.filter((c) => c.site_code === draft.site || c.location === draft.site)
  }, [cameras, draft.site])

  const hasActiveFilters = useMemo(
    () =>
      applied.q.trim() !== "" ||
      applied.site !== "all" ||
      applied.camera !== "all" ||
      applied.date_from !== "" ||
      applied.date_to !== "" ||
      applied.alert !== "all" ||
      applied.class_name.trim() !== "",
    [applied]
  )

  const applyFilters = () => {
    setApplied(draft)
    setPage(1)
  }

  const clearFilters = () => {
    setDraft(emptyFilters)
    setApplied(emptyFilters)
    setPage(1)
  }

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount)
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68

  return (
    <ModulePageLayout
      title="Object Detection"
<<<<<<< HEAD
      description="AI detection log with NLP search and database-wide filters."
=======
      description="YOLO detection log across all cameras — search and filter the full database."
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
      breadcrumbs={[{ label: "WMS" }, { label: "Object Detection" }]}
    >
      <div className="grid gap-6">
        <MlSystemStatus />

        <div className="grid gap-4 md:grid-cols-3">
<<<<<<< HEAD
          <StatCard
            title="Detections Today"
            value={summary?.detections_today ?? "—"}
            hint="Saved from live ML scans"
            icon={Scan}
            accent="bg-gradient-to-br from-[#3b82f6] to-[#2563eb]"
          />
          <StatCard
            title="Classes Tracked"
            value={summary?.classes_tracked ?? "—"}
            hint="Unique object types today"
            icon={Package}
            accent="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatCard
            title="Alerts"
            value={summary?.alerts_today ?? "—"}
            hint="Alert-class detections"
            icon={AlertTriangle}
            accent="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>

        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="space-y-4 border-b bg-muted/20 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5 text-[#3b82f6]" />
                  Detection Log
                </CardTitle>
                <CardDescription>
                  {PAGE_SIZE} records per page · filters query the{" "}
                  <strong>full database</strong>, not just the current page
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => void fetchPage(currentPage)} disabled={loading}>
                  Refresh
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                    <FilterX className="h-4 w-4" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="NLP search on class or label — smog, person, truck…"
                className="h-11 border-border/80 bg-background pl-10 shadow-sm"
                aria-label="Search class and label"
              />
            </div>

            <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4 text-[#3b82f6]" />
                Filters
                <span className="text-xs font-normal text-muted-foreground">(server-side · entire database)</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Site</Label>
                  <Select value={siteFilter} onValueChange={handleSiteChange}>
                    <SelectTrigger className="h-9 w-full min-w-0 bg-muted/30">
                      <SelectValue placeholder="All sites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All sites</SelectItem>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">NVR</Label>
                  <Select value={nvrFilter} onValueChange={handleNvrChange} disabled={filteredNvrs.length === 0}>
                    <SelectTrigger className="h-9 w-full min-w-0 bg-muted/30">
                      <SelectValue placeholder="All NVRs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All NVRs</SelectItem>
                      {filteredNvrs.map((n) => (
                        <SelectItem key={n.id} value={String(n.id)}>
                          <span className="truncate">{n.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Camera</Label>
                  <Select value={cameraFilter} onValueChange={setCameraFilter}>
                    <SelectTrigger className="h-9 w-full min-w-0 bg-muted/30">
                      <SelectValue placeholder="All cameras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All cameras</SelectItem>
                      {cameraOptions.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <span className="truncate">{c.name} · CH{c.channel}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Channel</Label>
                  <Select
                    value={channelFilter}
                    onValueChange={setChannelFilter}
                    disabled={cameraFilter !== ALL}
                  >
                    <SelectTrigger className="h-9 w-full min-w-0 bg-muted/30">
                      <SelectValue placeholder="All channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All channels</SelectItem>
                      {channelOptions.map((ch) => (
                        <SelectItem key={ch} value={String(ch)}>
                          CH {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Zone</Label>
                  <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger className="h-9 w-full min-w-0 bg-muted/30">
                      <SelectValue placeholder="All zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>All zones</SelectItem>
                      {zoneOptions.map((z) => (
                        <SelectItem key={z} value={z}>
                          {z}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Date from</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-full min-w-0 bg-muted/30"
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Date to</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-full min-w-0 bg-muted/30"
                  />
                </div>
              </div>

              {activeFilterChips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  {activeFilterChips.map((chip) => (
                    <Badge key={chip} variant="secondary" className="text-[11px] font-normal">
                      {chip}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </>
                ) : filtersAppliedOnServer || hasActiveFilters ? (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <strong className="text-foreground">{totalCount.toLocaleString()}</strong> matches in database
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <strong className="text-foreground">{totalCount.toLocaleString()}</strong> total records
                  </>
                )}
              </span>
              {totalCount > 0 && (
                <span>
                  Page {currentPage} of {totalPages} · rows {pageStart}–{pageEnd}
                </span>
              )}
            </div>

            <div className="w-full overflow-x-auto px-4 pb-2">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Time</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Site</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">NVR</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Ch</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Camera</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Zone</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Purpose</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Class</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Label</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Confidence</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-background/95 backdrop-blur">Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="py-16 text-center">
                        <div className="mx-auto max-w-md space-y-2 text-muted-foreground">
                          <Search className="mx-auto h-8 w-8 opacity-40" />
                          <p className="text-sm">{emptyMessage}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((row) => <DetectionRow key={row.id} row={row} />)
                  )}
                  {loading && events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="py-16 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#3b82f6]" />
                      </TableCell>
                    </TableRow>
=======
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Detections Today</CardTitle>
              <Scan className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{summary?.detections_today ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Saved ML readings today</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes Tracked</CardTitle>
              <Package className="h-4 w-4 text-sky-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{summary?.classes_tracked ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique object types today</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alerts Today</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{summary?.alerts_today ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">Fire, smoke, and alert-class events</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  Filters
                </CardTitle>
                <CardDescription>
                  Filters query the full detection database on the server, not just the current page.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1.5" />
                    Clear filters
                  </Button>
                )}
                <Button size="sm" onClick={applyFilters}>
                  Apply filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <Label htmlFor="det-search">Search (class, label, synonyms)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="det-search"
                  className="pl-9"
                  placeholder="e.g. smoke, person, vehicle, fire…"
                  value={draft.q}
                  onChange={(e) => setDraft((f) => ({ ...f, q: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Select
                value={draft.site}
                onValueChange={(v) => setDraft((f) => ({ ...f, site: v, camera: "all" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sites</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Camera</Label>
              <Select
                value={draft.camera}
                onValueChange={(v) => setDraft((f) => ({ ...f, camera: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All cameras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cameras</SelectItem>
                  {siteCameras.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.code} · {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-from">Date from</Label>
              <Input
                id="det-from"
                type="date"
                value={draft.date_from}
                onChange={(e) => setDraft((f) => ({ ...f, date_from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-to">Date to</Label>
              <Input
                id="det-to"
                type="date"
                value={draft.date_to}
                onChange={(e) => setDraft((f) => ({ ...f, date_to: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Alert status</Label>
              <Select
                value={draft.alert}
                onValueChange={(v) => setDraft((f) => ({ ...f, alert: v as AppliedFilters["alert"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="alerts">Alerts only</SelectItem>
                  <SelectItem value="normal">Normal only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-class">Class name</Label>
              <Input
                id="det-class"
                placeholder="e.g. person, car"
                value={draft.class_name}
                onChange={(e) => setDraft((f) => ({ ...f, class_name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="w-full min-w-0 shadow-sm">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Detection Log</CardTitle>
              <CardDescription>
                {totalCount > 0
                  ? `Showing ${rangeStart}–${rangeEnd} of ${totalCount.toLocaleString()} records`
                  : hasActiveFilters
                    ? "No records match your filters"
                    : "No detections recorded yet"}
                {hasActiveFilters && totalCount > 0 ? " (filtered from full database)" : ""}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit">
              {PAGE_SIZE} per page
            </Badge>
          </CardHeader>
          <CardContent className="w-full min-w-0 space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load detection events"}
              </div>
            )}

            <div className="w-full overflow-x-auto rounded-lg border">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[170px]">Date & time</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="w-[140px]">Confidence</TableHead>
                    <TableHead>Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        Loading detection records…
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        <Camera className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        {hasActiveFilters
                          ? "No detections match your filters. Try broader search terms or clear filters."
                          : "No detections yet. Assign an AI purpose to cameras and open live feeds."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((row) => (
                      <TableRow key={row.id} className={row.is_alert ? "bg-amber-50/50 dark:bg-amber-950/10" : undefined}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {formatDateTime(row.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.site_name || row.site_code || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{row.camera_code}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {row.camera_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {row.class_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate" title={row.label}>
                          {row.label}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden min-w-[72px]">
                              <div
                                className={`h-full rounded-full ${confidenceTone(row.confidence)}`}
                                style={{ width: `${Math.round(row.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium tabular-nums w-9 text-right">
                              {(row.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.is_alert ? (
                            <Badge variant="destructive" className="gap-1">
                              <Flame className="h-3 w-3" />
                              Alert
                            </Badge>
                          ) : (
                            <Badge variant="outline">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
<<<<<<< HEAD
              <div className="flex flex-col items-center justify-between gap-3 border-t bg-muted/10 px-4 py-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  {PAGE_SIZE} records per page · use arrows to browse all database results
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => goToPage(1)}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => goToPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[120px] px-2 text-center text-sm font-medium tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => goToPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => goToPage(totalPages)}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
=======
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
>>>>>>> 012abc6293f29ac44e674d2a27539de9a34fec68
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
