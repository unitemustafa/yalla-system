"use client";

import {
  seedStaffMembers,
  staffStorageKey,
  type StaffFormValues,
  type StaffMember,
} from "./data";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function buildStaffRecord(values: StaffFormValues, id?: string): StaffMember {
  const timestamp = new Date().toISOString();
  const ageValue = values.age.trim() ? Number(values.age) : null;
  const name = values.name.trim() || "New Staff Member";
  const username = values.username.trim() || `staff.${Date.now()}`;
  const email = values.email.trim() || "staff@example.com";
  const phone = values.phone.trim() || "0";

  return {
    id: id ?? generateStaffId(),
    name,
    username,
    email,
    phone,
    role: (values.role || "Waiter") as StaffMember["role"],
    status: "active",
    shiftType: values.shiftType === "Not specified" ? "" : values.shiftType,
    branch: values.branch,
    age: Number.isFinite(ageValue) ? ageValue : null,
    address: values.address.trim(),
    tablesCount: 0,
    permissions: ["read"],
    createdBy: "69cbca90da181ca0c102de48",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function generateStaffId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `staff-${Date.now()}`;
}

export function readStaffMembers(): StaffMember[] {
  if (!canUseStorage()) {
    return seedStaffMembers;
  }

  const savedValue = window.localStorage.getItem(staffStorageKey);

  if (!savedValue) {
    window.localStorage.setItem(staffStorageKey, JSON.stringify(seedStaffMembers));
    return seedStaffMembers;
  }

  const parsedValue = JSON.parse(savedValue) as StaffMember[];
  if (!Array.isArray(parsedValue)) {
    window.localStorage.setItem(staffStorageKey, JSON.stringify(seedStaffMembers));
    return seedStaffMembers;
  }

  return parsedValue;
}

export function writeStaffMembers(members: StaffMember[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(staffStorageKey, JSON.stringify(members));
}

export function resetStaffMembers() {
  writeStaffMembers(seedStaffMembers);
  return seedStaffMembers;
}

export function findStaffMemberById(id: string) {
  return readStaffMembers().find((member) => member.id === id) ?? null;
}

export function createStaffMember(values: StaffFormValues) {
  const nextMember = buildStaffRecord(values);
  const members = [...readStaffMembers(), nextMember];
  writeStaffMembers(members);
  return nextMember;
}

export function updateStaffMember(id: string, values: StaffFormValues) {
  const members = readStaffMembers();
  const currentMember = members.find((member) => member.id === id);

  if (!currentMember) {
    return null;
  }

  const nextMember: StaffMember = {
    ...buildStaffRecord(values, id),
    createdAt: currentMember.createdAt,
    createdBy: currentMember.createdBy,
    permissions: currentMember.permissions,
    tablesCount: currentMember.tablesCount,
    status: currentMember.status,
    updatedAt: new Date().toISOString(),
  };

  writeStaffMembers(
    members.map((member) => (member.id === id ? nextMember : member)),
  );

  return nextMember;
}

export function deleteStaffMember(id: string) {
  const members = readStaffMembers();
  const nextMembers = members.filter((member) => member.id !== id);
  writeStaffMembers(nextMembers);
}
