"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useMountedOnFrame } from "../hooks";
import {
  emptyStaffFormValues,
  staffMemberToFormValues,
  type StaffFormValues,
  type StaffMember,
} from "./data";
import {
  StaffActionBar,
  StaffFormFields,
  StaffFormLayout,
} from "./components";
import {
  createStaffMember,
  findStaffMemberById,
  updateStaffMember,
} from "./storage";

function FormPageSkeleton() {
  return (
    <div className="px-6 py-6">
      <div className="h-[58px] animate-pulse rounded-xl border bg-card" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_166px]">
        <div className="space-y-4">
          <div className="h-[315px] animate-pulse rounded-xl border bg-card" />
          <div className="h-[150px] animate-pulse rounded-xl border bg-card" />
        </div>
        <div className="h-[220px] animate-pulse rounded-xl border bg-card" />
      </div>
    </div>
  );
}

function MissingStaffState() {
  const router = useRouter();

  return (
    <div className="px-6 py-6">
      <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Staff member not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested user record is unavailable.
        </p>
        <button
          type="button"
          onClick={() => router.push("/users")}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Back to Staff
        </button>
      </div>
    </div>
  );
}

function FormPageBody({
  mode,
  userId,
  backHref,
  initialValues,
}: {
  mode: "create" | "edit";
  userId?: string;
  backHref: string;
  initialValues: StaffFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<StaffFormValues>(initialValues);

  function updateField(field: keyof StaffFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function handleSubmit() {
    if (mode === "create") {
      createStaffMember(values);
    } else if (userId) {
      updateStaffMember(userId, values);
    }

    router.push(backHref);
  }

  return (
    <div className="px-6 py-6">
      <StaffActionBar
        primaryLabel={mode === "create" ? "Save User" : "Update User"}
        primaryAction={handleSubmit}
        backHref={backHref}
      />

      <StaffFormLayout>
        <StaffFormFields mode={mode} values={values} onChange={updateField} />
      </StaffFormLayout>
    </div>
  );
}

export function UserFormPage({
  mode,
  userId,
  backHref = "/users",
}: {
  mode: "create" | "edit";
  userId?: string;
  backHref?: string;
}) {
  const mounted = useMountedOnFrame();

  const member = useMemo<StaffMember | null>(() => {
    if (!mounted || mode !== "edit" || !userId) {
      return null;
    }

    return findStaffMemberById(userId);
  }, [mounted, mode, userId]);

  if (!mounted) {
    return <FormPageSkeleton />;
  }

  if (mode === "edit" && !member) {
    return <MissingStaffState />;
  }

  return (
    <FormPageBody
      key={`${mode}-${userId ?? "new"}`}
      mode={mode}
      userId={userId}
      backHref={backHref}
      initialValues={
        mode === "edit" && member
          ? staffMemberToFormValues(member)
          : emptyStaffFormValues()
      }
    />
  );
}
