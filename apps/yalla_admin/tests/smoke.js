/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");
const { spawn } = require("node:child_process");

const baseURL = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3010";
const backendURL = "http://127.0.0.1:4010/api/v1";
let nextProcess;
let backendServer;

const adminUser = {
  id: "1",
  email: "admin@example.com",
  first_name: "Admin",
  last_name: "User",
  username: "admin",
  phone: "+218910000000",
  role: "admin",
  avatar_url: null,
};

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function startBackend() {
  backendServer = http.createServer((request, response) => {
    const path = request.url;
    if (path === "/api/v1/auth/login" && request.method === "POST") {
      let body = "";
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        const input = JSON.parse(body || "{}");
        if (input.password !== "Password123!") {
          return json(response, 401, { detail: "Invalid login credentials." });
        }
        const user =
          input.email === "client@example.com"
            ? { ...adminUser, email: input.email, role: "client" }
            : adminUser;
        return json(response, 200, {
          accessToken: "expired-access",
          refreshToken: "refresh-token",
          expiresIn: 900,
          user,
        });
      });
      return;
    }
    if (path === "/api/v1/auth/refresh") {
      return json(response, 200, {
        accessToken: "fresh-access",
        refreshToken: "next-refresh",
        expiresIn: 900,
      });
    }
    if (path === "/api/v1/auth/me") {
      if (request.headers.authorization !== "Bearer fresh-access") {
        return json(response, 401, { detail: "Token is invalid." });
      }
      return json(response, 200, { user: adminUser });
    }
    if (path === "/api/v1/dashboard/items") {
      return json(response, 200, { items: [] });
    }
    if (path === "/api/v1/dashboard/cities") {
      return json(response, 200, { cities: [] });
    }
    if (path === "/api/v1/dashboard/markets") {
      return json(response, 200, { markets: [] });
    }
    if (path === "/api/v1/auth/logout") return json(response, 200, { ok: true });
    return json(response, 404, { detail: "Not found." });
  });
  return new Promise((resolve) => backendServer.listen(4010, resolve));
}

async function waitForNext() {
  for (let index = 0; index < 60; index += 1) {
    try {
      if ((await fetch(`${baseURL}/login`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for Next.js.");
}

async function startNext() {
  nextProcess = spawn("npm", ["run", "dev", "--", "-p", "3010"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BACKEND_API_BASE_URL: backendURL,
      SESSION_SECRET: "smoke-session-secret",
    },
    stdio: "ignore",
  });
  await waitForNext();
}

function mergeCookies(current, response) {
  const raw = response.headers.get("set-cookie");
  if (!raw) return current;
  const next = new Map(
    current
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.split(/=(.*)/s).slice(0, 2)),
  );
  for (const cookie of raw.split(/,(?=\s*[^;,=]+=[^;,]+)/)) {
    const [pair] = cookie.trim().split(";");
    const [name, value] = pair.split(/=(.*)/s).slice(0, 2);
    if (value) next.set(name, value);
    else next.delete(name);
  }
  return [...next.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, options = {}, cookie = "") {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return { response, data, cookie: mergeCookies(cookie, response) };
}

async function main() {
  await startBackend();
  await startNext();

  const unauthorized = await request("/api/dashboard/items");
  if (unauthorized.response.status !== 401) throw new Error("Expected 401.");

  const rejected = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "client@example.com",
      password: "Password123!",
    }),
  });
  if (rejected.response.status !== 403) throw new Error("Expected admin rejection.");

  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@example.com",
      password: "Password123!",
      remember: true,
    }),
  });
  if (!login.response.ok || !login.cookie.includes("yalla-session=")) {
    throw new Error("Backend login did not create HttpOnly session cookies.");
  }

  const session = await request("/api/auth/session", {}, login.cookie);
  if (!session.response.ok || session.data?.user?.role !== "admin") {
    throw new Error("Session did not refresh access and load /auth/me.");
  }

  const items = await request("/api/dashboard/items", {}, session.cookie);
  const cities = await request("/api/dashboard/cities", {}, session.cookie);
  const markets = await request("/api/dashboard/markets", {}, session.cookie);
  if (!Array.isArray(items.data?.items)) throw new Error("Items proxy failed.");
  if (!Array.isArray(cities.data?.cities)) throw new Error("Cities proxy failed.");
  if (!Array.isArray(markets.data?.markets)) throw new Error("Markets proxy failed.");

  console.log("Smoke passed: Django auth, refresh-once, provider session, cities and markets.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    nextProcess?.kill("SIGTERM");
    backendServer?.close();
  });
