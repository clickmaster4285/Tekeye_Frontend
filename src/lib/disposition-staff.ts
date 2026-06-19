import dispositionData from "@/data/peshawar-enforcement-disposition.json";
import type { StaffRecord } from "@/lib/staff-api";

export type DispositionEmployee = {
  s_no: number;
  name: string;
  father_name: string;
  designation: string;
  bps: string;
};

type DispositionFile = {
  title: string;
  organization: {
    name: string;
    department: string;
    city: string;
  };
  total_count: number;
  employees: DispositionEmployee[];
};

const file = dispositionData as DispositionFile;
const ORG_NAME = file.organization.name;
const DEPARTMENT = file.organization.department;

/** Disposition records use negative ids (-s_no) to avoid colliding with database ids. */
export function dispositionStaffId(sNo: number): number {
  return -sNo;
}

export function isDispositionStaffId(id: number): boolean {
  return Number.isInteger(id) && id < 0;
}

export function dispositionSNoFromId(id: number): number {
  return -id;
}

function toStaffRecord(emp: DispositionEmployee): StaffRecord {
  return {
    id: dispositionStaffId(emp.s_no),
    user: null,
    full_name: emp.name,
    father_name: emp.father_name,
    cnic: "",
    profile_image: null,
    designation: emp.designation,
    department: DEPARTMENT,
    personal_number: String(emp.s_no),
    bps: emp.bps,
    current_posting: ORG_NAME,
    collector_name: ORG_NAME,
    branch_location: ORG_NAME,
    employment_type: "Permanent",
    record_source: "disposition",
    notes: file.title,
  };
}

let cached: StaffRecord[] | null = null;

export function getDispositionStaff(): StaffRecord[] {
  if (!cached) {
    cached = file.employees.map(toStaffRecord);
  }
  return cached;
}

export function getDispositionStaffById(id: number): StaffRecord | undefined {
  if (!isDispositionStaffId(id)) return undefined;
  return getDispositionStaff().find((s) => s.id === id);
}

export function getDispositionMeta() {
  return {
    title: file.title,
    organization: file.organization,
    total_count: file.total_count,
  };
}
