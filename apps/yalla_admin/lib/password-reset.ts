import { createHash, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

const resetCodeTtlMs = 10 * 60 * 1000;
const resetTokenTtlMs = 10 * 60 * 1000;

type PasswordResetRecord = {
  codeHash: string;
  email: string;
  expiresAt: number;
  tokenHash?: string;
  tokenExpiresAt?: number;
};

const resetState = globalThis as typeof globalThis & {
  __yallaPasswordResetRecords?: Map<string, PasswordResetRecord>;
};

function getStore() {
  if (!resetState.__yallaPasswordResetRecords) {
    resetState.__yallaPasswordResetRecords = new Map();
  }

  return resetState.__yallaPasswordResetRecords;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

export function createPasswordResetCode(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  getStore().set(normalizedEmail, {
    codeHash: hashValue(code),
    email: normalizedEmail,
    expiresAt: Date.now() + resetCodeTtlMs,
  });

  console.info(
    `[Yalla Admin] Password reset code for ${normalizedEmail}: ${code}`,
  );

  return {
    code,
    email: normalizedEmail,
    expiresAt: new Date(Date.now() + resetCodeTtlMs).toISOString(),
  };
}

export function verifyPasswordResetCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const record = getStore().get(normalizedEmail);

  if (!record || record.expiresAt < Date.now()) {
    getStore().delete(normalizedEmail);
    return null;
  }

  if (!/^\d{6}$/.test(code)) {
    return null;
  }

  const codeHash = hashValue(code);
  if (!valuesMatch(codeHash, record.codeHash)) {
    return null;
  }

  const token = randomUUID();
  record.tokenHash = hashValue(token);
  record.tokenExpiresAt = Date.now() + resetTokenTtlMs;

  return {
    resetToken: token,
    expiresAt: new Date(record.tokenExpiresAt).toISOString(),
  };
}

export function consumePasswordResetToken(email: string, resetToken: string) {
  const normalizedEmail = normalizeEmail(email);
  const record = getStore().get(normalizedEmail);

  if (
    !record?.tokenHash ||
    !record.tokenExpiresAt ||
    record.tokenExpiresAt < Date.now()
  ) {
    getStore().delete(normalizedEmail);
    return false;
  }

  const tokenHash = hashValue(resetToken);
  if (!valuesMatch(tokenHash, record.tokenHash)) {
    return false;
  }

  getStore().delete(normalizedEmail);
  return true;
}
