import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import {
  getDashboardAccountEmail,
  normalizeAccountEmail,
  updateDashboardAccountEmail,
} from "@/lib/account-email";

const emailChangeCodeTtlMs = 10 * 60 * 1000;

type EmailChangeRecord = {
  codeHash: string;
  expiresAt: number;
  newEmail: string;
  oldEmail: string;
};

const emailChangeState = globalThis as typeof globalThis & {
  __yallaEmailChangeRecords?: Map<string, EmailChangeRecord>;
};

function getStore() {
  if (!emailChangeState.__yallaEmailChangeRecords) {
    emailChangeState.__yallaEmailChangeRecords = new Map();
  }

  return emailChangeState.__yallaEmailChangeRecords;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function valuesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createEmailChangeCode(newEmail: string) {
  const oldEmail = normalizeAccountEmail(getDashboardAccountEmail());
  const normalizedNewEmail = normalizeAccountEmail(newEmail);

  if (!normalizedNewEmail || normalizedNewEmail === oldEmail) {
    return null;
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  getStore().set(oldEmail, {
    codeHash: hashValue(code),
    expiresAt: Date.now() + emailChangeCodeTtlMs,
    newEmail: normalizedNewEmail,
    oldEmail,
  });

  console.info(
    `[Yalla Admin] Email change code for ${oldEmail}: ${code} -> ${normalizedNewEmail}`,
  );

  return {
    code,
    expiresAt: new Date(Date.now() + emailChangeCodeTtlMs).toISOString(),
    newEmail: normalizedNewEmail,
    oldEmail,
  };
}

export function confirmEmailChange(code: string) {
  const oldEmail = normalizeAccountEmail(getDashboardAccountEmail());
  const record = getStore().get(oldEmail);

  if (!record || record.expiresAt < Date.now()) {
    getStore().delete(oldEmail);
    return null;
  }

  if (!/^\d{6}$/.test(code)) {
    return null;
  }

  if (!valuesMatch(hashValue(code), record.codeHash)) {
    return null;
  }

  getStore().delete(oldEmail);

  return {
    email: updateDashboardAccountEmail(record.newEmail),
    oldEmail: record.oldEmail,
  };
}
