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
<<<<<<< HEAD
=======
  user_type?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
};

export type BackendLoginResponse = {
  access?: string;
  refresh?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: BackendUser;
  data?: {
    access?: string;
    refresh?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: BackendUser;
  };
  tokens?: {
    access?: string;
    refresh?: string;
    accessToken?: string;
    refreshToken?: string;
  };
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
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_BASE_URL?.trim() ||
    fallbackBackendBaseUrl
  ).replace(/\/+$/, "");
}

export function backendUrl(path: string) {
  return `${backendApiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

export function backendAuthUrl(path: string) {
  return backendUrl(`auth/${path}`);
}

export function isAllowedDashboardRole(role: string | undefined) {
<<<<<<< HEAD
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

=======
  const normalized = role?.trim().toLowerCase();
  const allowedRoles = (process.env.DASHBOARD_ALLOWED_ROLES || "admin")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Boolean(normalized && allowedRoles.includes(normalized));
}

export function normalizeDashboardUser(user: BackendUser | undefined) {
  if (!user?.email) return null;
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
  const firstName = user.first_name ?? user.firstName ?? "";
  const lastName = user.last_name ?? user.lastName ?? "";
  const role = user.role ?? user.user_type ?? "";
  const name =
    [firstName, lastName].map((part) => part.trim()).filter(Boolean).join(" ") ||
    user.username ||
    user.email;

  return {
    id: user.id === undefined ? undefined : String(user.id),
    email: user.email,
    name,
<<<<<<< HEAD
    role: user.role,
=======
    firstName,
    lastName,
    username: user.username ?? "",
    phone: user.phone ?? "",
    role,
    avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
  } satisfies DashboardUser;
}

export function extractBackendTokens(data: BackendLoginResponse | null) {
  return {
    accessToken:
      data?.accessToken ??
      data?.access ??
      data?.tokens?.accessToken ??
      data?.tokens?.access ??
      data?.data?.accessToken ??
      data?.data?.access,
    refreshToken:
      data?.refreshToken ??
      data?.refresh ??
      data?.tokens?.refreshToken ??
      data?.tokens?.refresh ??
      data?.data?.refreshToken ??
      data?.data?.refresh,
  };
}

export function extractBackendUser(data: BackendLoginResponse | null) {
  return data?.user ?? data?.data?.user;
}

export function extractBackendErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, unknown>;
<<<<<<< HEAD
  const directMessage = record.message ?? record.detail;

=======
  const directMessage = record.message ?? record.detail ?? record.error;
>>>>>>> 56ecfc2 (link dashboard order, items,auth api with backend)
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
