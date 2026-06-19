import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react"
import {
  Scan,
  Package,
  AlertTriangle,
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
} from "lucide-react"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MlSystemStatus } from "@/components/cameras/ml-system-status"
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
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

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

  return (
    <ModulePageLayout
      title="Object Detection"
      description="AI detection log with NLP search and database-wide filters."
      breadcrumbs={[{ label: "WMS" }, { label: "Object Detection" }]}
    >
      <div className="grid gap-6">
        <MlSystemStatus />

        <div className="grid gap-4 md:grid-cols-3">
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
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
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
