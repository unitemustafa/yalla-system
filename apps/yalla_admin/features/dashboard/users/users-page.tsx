"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useMountedOnFrame } from "../hooks";
import {
  defaultStaffFilters,
  type StaffFilters,
} from "./data";
import {
  StaffEmptyState,
  StaffErrorState,
  StaffFiltersBar,
  StaffLoadingState,
  StaffPageHeader,
  StaffPagination,
  StaffTable,
  StaffTableCard,
} from "./components";
import { readStaffMembers, resetStaffMembers } from "./storage";
import { filtersChanged, formatShiftType } from "./utils";

export function UsersPage() {
  const mounted = useMountedOnFrame();
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const [draftFilters, setDraftFilters] = useState<StaffFilters>(defaultStaffFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<StaffFilters>(defaultStaffFilters);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-staff-menu]")) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const staffState = useMemo(() => {
    void reloadKey;

    if (!mounted) {
      return { members: [], error: false };
    }

    try {
      return { members: readStaffMembers(), error: false };
    } catch (error) {
      console.error(error);
      return { members: [], error: true };
    }
  }, [mounted, reloadKey]);

  const filteredMembers = useMemo(() => {
    return staffState.members.filter((member) => {
      const matchesSearch =
        !appliedFilters.search ||
        [member.name, member.username, member.email, member.phone]
          .join(" ")
          .toLowerCase()
          .includes(appliedFilters.search.toLowerCase());

      const matchesRole =
        appliedFilters.role === "All" || member.role === appliedFilters.role;

      const matchesShift =
        appliedFilters.shiftType === "All" ||
        formatShiftType(member.shiftType) === appliedFilters.shiftType;

      return matchesSearch && matchesRole && matchesShift;
    });
  }, [appliedFilters, staffState.members]);

  const applyDisabled = !filtersChanged(draftFilters, appliedFilters);
  const clearDisabled =
    !filtersChanged(draftFilters, defaultStaffFilters) &&
    !filtersChanged(appliedFilters, defaultStaffFilters);

  function handleResetData() {
    resetStaffMembers();
    setDraftFilters(defaultStaffFilters);
    setAppliedFilters(defaultStaffFilters);
    setReloadKey((value) => value + 1);
  }

  return (
    <div className="px-6 py-8">
      <StaffPageHeader />

      <StaffTableCard>
        {!mounted ? (
          <StaffLoadingState />
        ) : staffState.error ? (
          <StaffErrorState onReset={handleResetData} />
        ) : (
          <>
            <StaffFiltersBar
              draft={draftFilters}
              applyDisabled={applyDisabled}
              clearDisabled={clearDisabled}
              onChange={setDraftFilters}
              onApply={() => setAppliedFilters(draftFilters)}
              onClear={() => {
                setDraftFilters(defaultStaffFilters);
                setAppliedFilters(defaultStaffFilters);
              }}
            />
            {filteredMembers.length > 0 ? (
              <>
                <StaffTable
                  members={filteredMembers}
                  openMenuId={openMenuId}
                  onToggleMenu={(id) =>
                    setOpenMenuId((currentId) => (currentId === id ? null : id))
                  }
                  onRowClick={(id) => router.push(`/users/${id}`)}
                />
                <StaffPagination count={filteredMembers.length} />
              </>
            ) : (
              <StaffEmptyState />
            )}
          </>
        )}
      </StaffTableCard>
    </div>
  );
}
