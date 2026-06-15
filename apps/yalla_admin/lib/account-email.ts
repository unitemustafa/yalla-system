export const defaultDashboardAccountEmail = "m.abdeljalel@yalla-market.com";

const accountEmailState = globalThis as typeof globalThis & {
  __yallaDashboardAccountEmail?: string;
};

export function normalizeAccountEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getDashboardAccountEmail() {
  return accountEmailState.__yallaDashboardAccountEmail ?? defaultDashboardAccountEmail;
}

export function updateDashboardAccountEmail(email: string) {
  const normalizedEmail = normalizeAccountEmail(email);
  accountEmailState.__yallaDashboardAccountEmail = normalizedEmail;

  return normalizedEmail;
}

export function isDashboardAccountEmail(email: string) {
  return normalizeAccountEmail(email) === normalizeAccountEmail(getDashboardAccountEmail());
}
