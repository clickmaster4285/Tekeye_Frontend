import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchStaffById, updateStaff, isDispositionStaffId, type StaffRecord } from "@/lib/staff-api"
import { ROUTES } from "@/routes/config"
import { useToast } from "@/hooks/use-toast"
import { ModulePageLayout } from "@/components/dashboard/module-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const staffId = id ? parseInt(id, 10) : NaN

  const { data: staff, isLoading, isError } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => fetchStaffById(staffId),
    enabled: Number.isInteger(staffId),
  })

  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")
  const [phonePrimary, setPhonePrimary] = useState("")
  const [jobStatus, setJobStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [personalNumber, setPersonalNumber] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [bps, setBps] = useState("")
  const [qualification, setQualification] = useState("")
  const [currentPosting, setCurrentPosting] = useState("")
  const [collectorName, setCollectorName] = useState("")
  const [transferredFrom, setTransferredFrom] = useState("")
  const [transferredTo, setTransferredTo] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [branchLocation, setBranchLocation] = useState("")

  useEffect(() => {
    if (staff) {
      const s = staff as StaffRecord
      setFullName(s.full_name ?? "")
      setFatherName(s.father_name ?? "")
      setDesignation(s.designation ?? "")
      setDepartment(s.department ?? "")
      setEmail(s.email ?? "")
      setPhonePrimary(s.phone_primary ?? s.phone ?? "")
      setJobStatus(s.job_status ?? "")
      setNotes(s.notes ?? "")
      setPersonalNumber(s.personal_number ?? "")
      setEmployeeId(s.employee_id ?? "")
      setBps(s.bps ?? "")
      setQualification(s.qualification ?? "")
      setCurrentPosting(s.current_posting ?? s.branch_location ?? "")
      setCollectorName(s.collector_name ?? "")
      setTransferredFrom(s.transferred_from ?? "")
      setTransferredTo(s.transferred_to ?? "")
      setEmploymentType(s.employment_type ?? "")
      setBranchLocation(s.branch_location ?? "")
    }
  }, [staff])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!Number.isInteger(staffId)) return
    setSaving(true)
    try {
      await updateStaff(staffId, {
        full_name: fullName,
        father_name: fatherName || undefined,
        designation,
        department,
        email: email || undefined,
        phone_primary: phonePrimary || undefined,
        job_status: jobStatus || undefined,
        notes: notes || undefined,
        personal_number: personalNumber || undefined,
        employee_id: employeeId || undefined,
        bps: bps || undefined,
        qualification: qualification || undefined,
        current_posting: currentPosting || undefined,
        collector_name: collectorName || undefined,
        transferred_from: transferredFrom || undefined,
        transferred_to: transferredTo || undefined,
        employment_type: employmentType || undefined,
        branch_location: branchLocation || undefined,
      })
      toast({ title: "Employee updated", description: "Changes have been saved." })
      queryClient.invalidateQueries({ queryKey: ["staff", staffId] })
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      navigate(`/employees/${staffId}`)
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Could not update employee",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (Number.isInteger(staffId) && isDispositionStaffId(staffId)) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <p className="text-muted-foreground mb-4">
          Disposition list records are read-only and cannot be edited here.
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.EMPLOYEES}>Back to Employees</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !id) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          {!id ? "Invalid employee" : "Loading…"}
        </div>
      </div>
    )
  }

  if (isError || !staff) {
    return (
      <div className="w-full px-4 sm:px-6 py-8">
        <p className="text-destructive mb-4">Employee not found.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.EMPLOYEES}>Back to Employees</Link>
        </Button>
      </div>
    )
  }

  const s = staff as StaffRecord

  return (
    <ModulePageLayout
      title="Edit employee"
      description={`Update details for ${s.full_name ?? "employee"}.`}
      breadcrumbs={[
        { label: "HR", href: ROUTES.EMPLOYEES },
        { label: "Employees", href: ROUTES.EMPLOYEES },
        { label: s.full_name ?? "Detail", href: `/employees/${s.id}` },
        { label: "Edit" },
      ]}
    >
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Employee record</CardTitle>
          <CardDescription>
            Edit fields stored for this employee. CNIC is managed when the record is created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Employee name *</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_name">Father&apos;s name</Label>
                <Input
                  id="father_name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal_number">Personal number</Label>
                <Input
                  id="personal_number"
                  value={personalNumber}
                  onChange={(e) => setPersonalNumber(e.target.value)}
                  placeholder="Employee personal / service number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile (primary)</Label>
                <Input
                  id="phone"
                  value={phonePrimary}
                  onChange={(e) => setPhonePrimary(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Official employee / service ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bps">BPS</Label>
                <Input id="bps" value={bps} onChange={(e) => setBps(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="current_posting">Current place of posting</Label>
                <Input
                  id="current_posting"
                  value={currentPosting}
                  onChange={(e) => setCurrentPosting(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch_location">Branch / location</Label>
                <Input
                  id="branch_location"
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="collector_name">Collector name</Label>
                <Input
                  id="collector_name"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferred_from">Transferred from</Label>
                <Input
                  id="transferred_from"
                  value={transferredFrom}
                  onChange={(e) => setTransferredFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferred_to">Transferred to</Label>
                <Input
                  id="transferred_to"
                  value={transferredTo}
                  onChange={(e) => setTransferredTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment type</Label>
                <Input
                  id="employment_type"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  placeholder="e.g. Permanent, Contract"
                />
              </div>
              <div className="space-y-2">
                <Label>Job status</Label>
                <Select value={jobStatus || "none"} onValueChange={(v) => setJobStatus(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On leave</SelectItem>
                    <SelectItem value="PROBATION">Probation</SelectItem>
                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/employees/${s.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ModulePageLayout>
  )
}
