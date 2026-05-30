export type StaffRole = "Admin" | "Waiter";
export type StaffStatus = "active" | "inactive" | "pending";

export type StaffMember = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  shiftType: string;
  branch: string;
  age?: number | null;
  address?: string;
  tablesCount: number;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type StaffFilters = {
  search: string;
  role: string;
  shiftType: string;
};

export type StaffFormValues = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  age: string;
  address: string;
  role: StaffRole | "";
  branch: string;
  shiftType: string;
};

export const staffStorageKey = "am-control-staff-users";

export const seedStaffMembers: StaffMember[] = [
  {
    id: "69cbcefa8728cdbf9fa6852b",
    name: "Mohamed Abdeljalel",
    username: "m.abdeljalel",
    email: "yallamarket26@gmail.com",
    phone: "+201120143585",
    role: "Admin",
    status: "active",
    shiftType: "",
    branch: "",
    age: null,
    address: "",
    tablesCount: 0,
    permissions: ["read"],
    createdBy: "69cbca90da181ca0c102de48",
    createdAt: "2026-03-31T00:00:00.000Z",
    updatedAt: "2026-03-31T00:00:00.000Z",
  },
];

export const defaultStaffFilters: StaffFilters = {
  search: "",
  role: "All",
  shiftType: "All",
};

export const staffRoleOptions: Array<{ label: string; value: StaffRole }> = [
  { label: "Admin", value: "Admin" },
  { label: "Waiter", value: "Waiter" },
];

export const staffRoleFilterOptions = [
  { label: "All", value: "All" },
  ...staffRoleOptions,
];

export const staffShiftOptions = [
  { label: "Select Shift", value: "" },
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
  { label: "Not specified", value: "Not specified" },
];

export const staffShiftFilterOptions = [
  { label: "All", value: "All" },
  { label: "Not specified", value: "Not specified" },
  { label: "Morning", value: "Morning" },
  { label: "Evening", value: "Evening" },
];

export const staffBranchOptions = [
  { label: "Select Branch", value: "" },
  { label: "All Branches", value: "All Branches" },
];

export function emptyStaffFormValues(): StaffFormValues {
  return {
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    age: "18",
    address: "",
    role: "Waiter",
    branch: "",
    shiftType: "",
  };
}

export function staffMemberToFormValues(member: StaffMember): StaffFormValues {
  return {
    name: member.name,
    username: member.username,
    email: member.email,
    phone: member.phone,
    password: "",
    age: member.age ? String(member.age) : "18",
    address: member.address ?? "",
    role: member.role,
    branch: member.branch,
    shiftType: member.shiftType,
  };
}
