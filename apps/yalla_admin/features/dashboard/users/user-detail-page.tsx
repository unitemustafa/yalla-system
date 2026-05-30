"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useMountedOnFrame } from "../hooks";
import { StaffDetailCards, StaffDetailHeader } from "./components";
import { findStaffMemberById, deleteStaffMember } from "./storage";

function DetailPageSkeleton() {
  return (
    <div className="px-6 py-8">
      <div className="h-20 animate-pulse rounded-xl bg-muted/30" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[320px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[260px] animate-pulse rounded-xl border bg-card lg:col-start-2" />
      </div>
    </div>
  );
}

export function UserDetailPage({ userId }: { userId: string }) {
  const mounted = useMountedOnFrame();
  const router = useRouter();

  const member = useMemo(() => {
    if (!mounted) {
      return null;
    }

    return findStaffMemberById(userId);
  }, [mounted, userId]);

  function handleDelete() {
    const confirmed = window.confirm("Delete this staff member?");
    if (!confirmed) {
      return;
    }

    deleteStaffMember(userId);
    router.push("/users");
  }

  if (!mounted) {
    return <DetailPageSkeleton />;
  }

  if (!member) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Staff member not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested user record is unavailable.
          </p>
          <Link
            href="/users"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <StaffDetailHeader
        editHref={`/users/edit/${member.id}?returnTo=%2Fusers%3F`}
        onDelete={handleDelete}
      />
      <StaffDetailCards member={member} />
    </div>
  );
}
