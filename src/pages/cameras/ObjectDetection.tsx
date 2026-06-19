import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Scan, Package, AlertTriangle, MapPin, Server, Video, Search, Loader2, FilterX } from "lucide-react"
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

const PAGE_SIZE = 25
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

function DetectionRow({ row }: { row: DetectionEvent }) {
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">{formatTime(row.created_at)}</TableCell>
      <TableCell>
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.site_name || "—"}</div>
            <div className="text-xs text-muted-foreground">{row.site_code}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1.5">
          <Server className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.nvr_name || "—"}</div>
            <div className="text-xs text-muted-foreground font-mono">{row.nvr_ip}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">CH {row.channel}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1.5">
          <Video className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.camera_name}</div>
            <div className="text-xs text-muted-foreground">{row.camera_code}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{row.zone || "—"}</TableCell>
      <TableCell>
        <Badge className="bg-[#3b82f6]/90 text-xs">{row.purpose_label}</Badge>
      </TableCell>
      <TableCell>{row.class_name}</TableCell>
      <TableCell>{row.label}</TableCell>
      <TableCell>{(row.confidence * 100).toFixed(0)}%</TableCell>
      <TableCell>
        <Badge variant={row.is_alert ? "destructive" : "outline"}>
          {row.is_alert ? "Alert" : "Normal"}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

export default function ObjectDetectionPage() {
  const [summary, setSummary] = useState<DetectionSummary | null>(null)
  const [events, setEvents] = useState<DetectionEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
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
  const [loadingMore, setLoadingMore] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const fetchingRef = useRef(false)

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

  const loadSummary = useCallback(() => {
    fetchDetectionSummary()
      .then(setSummary)
      .catch(() => setSummary({ detections_today: 0, classes_tracked: 0, alerts_today: 0 }))
  }, [])

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (fetchingRef.current) return
      fetchingRef.current = true
      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const data = await fetchDetectionEvents({ ...queryParams, page: pageNum })
        setTotalCount(data.count)
        setPage(data.page)
        setHasMore(data.page < data.total_pages)
        setEvents((prev) => (append ? [...prev, ...data.results] : data.results))
      } catch {
        if (!append) {
          setEvents([])
          setTotalCount(0)
          setHasMore(false)
        }
      } finally {
        fetchingRef.current = false
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [queryParams]
  )

  const resetAndLoad = useCallback(() => {
    setEvents([])
    setPage(1)
    setHasMore(false)
    void fetchPage(1, false)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return
    void fetchPage(page + 1, true)
  }, [hasMore, loading, loadingMore, fetchPage, page])

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
    resetAndLoad()
  }, [resetAndLoad])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  const emptyMessage = debouncedSearch
    ? `No detections match class/label "${debouncedSearch}". Try smog, person, truck…`
    : hasActiveFilters
      ? "No detections match the current filters."
      : "No saved detections yet. Open live camera feeds with ML enabled to record readings."

  return (
    <ModulePageLayout
      title="Object Detection"
      description="Saved YOLO detections — NLP search on class & label, plus site/NVR/camera filters."
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
              <p className="text-xs text-muted-foreground mt-1">Saved from live ML scans</p>
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
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Detection Log</CardTitle>
                <CardDescription>
                  NLP search on class &amp; label · {PAGE_SIZE} rows per page · scroll for more
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetAndLoad} disabled={loading}>
                  Refresh
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <FilterX className="h-4 w-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="NLP search class or label… e.g. smog, person, truck"
                className="pl-9"
                aria-label="Search class and label"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Searches detection <strong>class</strong> and <strong>label</strong> with synonyms &amp; fuzzy spelling
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 rounded-lg border bg-muted/30 p-3">
              <div className="min-w-0 space-y-1.5">
                <Label className="text-xs">Site</Label>
                <Select value={siteFilter} onValueChange={handleSiteChange}>
                  <SelectTrigger className="h-9 w-full min-w-0 bg-background">
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
                <Label className="text-xs">NVR</Label>
                <Select value={nvrFilter} onValueChange={handleNvrChange} disabled={filteredNvrs.length === 0}>
                  <SelectTrigger className="h-9 w-full min-w-0 bg-background">
                    <SelectValue placeholder="All NVRs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All NVRs</SelectItem>
                    {filteredNvrs.map((n) => (
                      <SelectItem key={n.id} value={String(n.id)}>
                        {n.name} ({n.ip_address})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label className="text-xs">Camera</Label>
                <Select value={cameraFilter} onValueChange={setCameraFilter}>
                  <SelectTrigger className="h-9 w-full min-w-0 bg-background">
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
                <Label className="text-xs">Channel</Label>
                <Select value={channelFilter} onValueChange={setChannelFilter} disabled={cameraFilter !== ALL}>
                  <SelectTrigger className="h-9 w-full min-w-0 bg-background">
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
                <Label className="text-xs">Zone</Label>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="h-9 w-full min-w-0 bg-background">
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
                <Label className="text-xs">Date from</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-full min-w-0 bg-background"
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label className="text-xs">Date to</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-full min-w-0 bg-background"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              {debouncedSearch ? (
                <span>
                  NLP match on class/label: <strong>{debouncedSearch}</strong>
                </span>
              ) : (
                <span>Most recent detections first</span>
              )}
              {totalCount > 0 && (
                <span>
                  Showing {events.length} of {totalCount.toLocaleString()}
                </span>
              )}
            </div>
            <div className="w-full overflow-x-auto rounded-lg border">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>NVR</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Camera</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((row) => <DetectionRow key={row.id} row={row} />)
                  )}
                  {loading && events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center py-2">
              {loadingMore && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more…
                </span>
              )}
              {!loading && !loadingMore && hasMore && events.length > 0 && (
                <Button variant="ghost" size="sm" onClick={loadMore}>
                  Load more
                </Button>
              )}
              {!hasMore && events.length > 0 && !loading && (
                <span className="text-xs text-muted-foreground">All records loaded</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  )
}
