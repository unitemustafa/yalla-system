/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("node:child_process");

const baseURL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const demoPassword = requireEnv("DASHBOARD_DEMO_PASSWORD");
const sessionSecret = requireEnv("SESSION_SECRET");
let serverProcess;

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to run the dashboard smoke test.`);
  }

  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  for (let index = 0; index < 60; index += 1) {
    try {
      const response = await fetch(`${baseURL}/login`);
      if (response.ok) {
        return true;
      }
    } catch {
      await sleep(1_000);
    }
  }

  return false;
}

async function ensureServer() {
  try {
    const response = await fetch(`${baseURL}/login`);
    if (response.ok) {
      return;
    }
  } catch {
    // Start the local server below.
  }

  serverProcess = spawn("npm", ["run", "dev"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DASHBOARD_DEMO_PASSWORD: demoPassword,
      SESSION_SECRET: sessionSecret,
    },
    shell: process.platform === "win32",
    stdio: "ignore",
  });

  const ready = await waitForServer();
  if (!ready) {
    throw new Error(`Timed out waiting for ${baseURL}`);
  }
}

function getCookie(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("Login response did not include a session cookie");
  }

  return setCookie.split(";")[0];
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return { response, data };
}

async function stopServer() {
  if (!serverProcess?.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(serverProcess.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  serverProcess.kill("SIGTERM");
}

async function main() {
  await ensureServer();

  const unauthorized = await jsonRequest("/api/dashboard/items");
  if (unauthorized.response.status !== 401) {
    throw new Error(`Expected unauthorized items request to return 401, got ${unauthorized.response.status}`);
  }

  const badLogin = await jsonRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@yalla.market", password: "wrong" }),
  });
  if (badLogin.response.status !== 401) {
    throw new Error(`Expected bad login to return 401, got ${badLogin.response.status}`);
  }

  const login = await jsonRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@yalla.market",
      password: demoPassword,
    }),
  });
  if (!login.response.ok) {
    throw new Error(`Expected login to succeed, got ${login.response.status}`);
  }

  const cookie = getCookie(login.response);
  const authHeaders = { cookie };
  const items = await jsonRequest("/api/dashboard/items", { headers: authHeaders });
  const orders = await jsonRequest("/api/dashboard/orders", { headers: authHeaders });

  if (!Array.isArray(items.data?.items) || items.data.items.length === 0) {
    throw new Error("Expected dashboard items API to return rows");
  }
  if (!Array.isArray(orders.data?.orders) || orders.data.orders.length === 0) {
    throw new Error("Expected dashboard orders API to return rows");
  }

  const firstItem = items.data.items[0];
  const originalActive = Boolean(firstItem.active);
  const nextActive = !originalActive;
  const patchedItem = await jsonRequest(
    `/api/dashboard/items/${encodeURIComponent(firstItem.id)}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ active: nextActive }),
    },
  );
  if (patchedItem.data?.item?.active !== nextActive) {
    throw new Error("Expected item active patch to persist");
  }

  await jsonRequest(`/api/dashboard/items/${encodeURIComponent(firstItem.id)}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ active: originalActive }),
  });

  const duplicatedItem = await jsonRequest(
    `/api/dashboard/items/${encodeURIComponent(firstItem.id)}/duplicate`,
    {
      method: "POST",
      headers: authHeaders,
    },
  );
  const duplicateId = duplicatedItem.data?.item?.id;
  if (!duplicatedItem.response.ok || !duplicateId) {
    throw new Error("Expected item duplicate API to return the copied item");
  }

  const deletedDuplicate = await jsonRequest(
    `/api/dashboard/items/${encodeURIComponent(duplicateId)}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );
  if (!deletedDuplicate.response.ok) {
    throw new Error("Expected duplicate cleanup delete to succeed");
  }

  const firstOrder = orders.data.orders[0];
  const patchedOrder = await jsonRequest(
    `/api/dashboard/orders/${encodeURIComponent(firstOrder.number)}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ status: "smoke-test-status" }),
    },
  );
  if (patchedOrder.data?.order?.status !== "smoke-test-status") {
    throw new Error("Expected order status patch to persist");
  }

  await jsonRequest(`/api/dashboard/orders/${encodeURIComponent(firstOrder.number)}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: firstOrder.status }),
  });

  console.log(
    `Smoke passed: ${items.data.items.length} items, ${orders.data.orders.length} orders, auth and mutations OK.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(stopServer);
