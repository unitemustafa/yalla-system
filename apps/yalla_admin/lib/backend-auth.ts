export type DashboardUser = {
  id?: string;
  email: string;
  name: string;
  role: string;
};

type BackendUser = {
  id?: string | number;
  email?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  username?: string;
  role?: string;
};

export type BackendLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: BackendUser;
};

const fallbackBackendBaseUrl = "http://127.0.0.1:8000/api/v1";
const fallbackAllowedRoles = "admin";

export function dashboardAuthMode() {
  const mode = process.env.DASHBOARD_AUTH_MODE?.trim().toLowerCase();

  if (mode === "demo" || mode === "backend") {
    return mode;
  }

  return process.env.BACKEND_API_BASE_URL?.trim() ? "backend" : "demo";
}

export function backendApiBaseUrl() {
  return (process.env.BACKEND_API_BASE_URL?.trim() || fallbackBackendBaseUrl)
    .replace(/\/+$/, "");
}

export function backendAuthUrl(path: string) {
  return `${backendApiBaseUrl()}/auth/${path.replace(/^\/+/, "")}`;
}

export function isAllowedDashboardRole(role: string | undefined) {
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedRole) {
    return false;
  }

  const roles = (process.env.DASHBOARD_ALLOWED_ROLES || fallbackAllowedRoles)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return roles.includes(normalizedRole);
}

export function normalizeDashboardUser(user: BackendUser | undefined) {
  if (!user?.email || !user.role) {
    return null;
  }

  const firstName = user.first_name ?? user.firstName ?? "";
  const lastName = user.last_name ?? user.lastName ?? "";
  const name =
    [firstName, lastName].map((part) => part.trim()).filter(Boolean).join(" ") ||
    user.username ||
    user.email;

  return {
    id: user.id === undefined ? undefined : String(user.id),
    email: user.email,
    name,
    role: user.role,
  } satisfies DashboardUser;
}

export function extractBackendErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;
  const directMessage = record.message ?? record.detail;

  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage;
  }

  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string" && item.trim());
      if (typeof first === "string") {
        return first;
      }
    }
  }

  return fallback;
}
