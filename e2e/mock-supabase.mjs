import http from "node:http";
import { randomUUID } from "node:crypto";
const id = "00000000-0000-4000-8000-000000000001";
const user = {
  id,
  aud: "authenticated",
  role: "authenticated",
  email: "test@lifeos.test",
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { name: "Test User" },
  created_at: new Date().toISOString(),
};
const encode = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
const tables = {
  profiles: [
    {
      id,
      name: "Test User",
      email: user.email,
      currency: "GBP",
      weekly_budget: 150,
    },
  ],
  budgets: [
    { id: randomUUID(), user_id: id, period_type: "weekly", amount: 150 },
  ],
  expense_categories: [{ id: randomUUID(), user_id: null, name: "Food" }],
};
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3100");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "authorization,apikey,content-type,x-client-info,prefer,x-supabase-api-version,accept-profile,content-profile,x-retry-count",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const url = new URL(req.url, "http://localhost");
  let body = "";
  for await (const chunk of req) body += chunk;
  const input = body ? JSON.parse(body) : {};
  const send = (value, status = 200) => {
    res.writeHead(status);
    res.end(JSON.stringify(value));
  };
  if (url.pathname === "/health") return send({ ok: true });
  if (url.pathname === "/auth/v1/token")
    return input.email === "test@lifeos.test" &&
      input.password === "password123"
      ? send({
          access_token: token,
          refresh_token: "test-refresh-token",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user,
        })
      : send(
          {
            error: "invalid_grant",
            error_description: "Invalid login credentials",
          },
          400,
        );
  if (url.pathname === "/auth/v1/user")
    return req.headers.authorization === `Bearer ${token}`
      ? send(user)
      : send({ message: "Invalid JWT" }, 401);
  if (url.pathname === "/auth/v1/logout") return send({});
  const table = url.pathname.replace("/rest/v1/", "");
  const rows = (tables[table] ??= []);
  tables[table] = rows;
  const matches = (row) =>
    [...url.searchParams].every(
      ([key, val]) =>
        !val.startsWith("eq.") || String(row[key]) === val.slice(3),
    );
  if (req.method === "GET")
    return send(
      req.headers.accept?.includes("vnd.pgrst.object")
        ? rows.find(matches) || null
        : rows.filter(matches),
    );
  if (req.method === "POST") {
    const incoming = {
      id: randomUUID(),
      user_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...input,
    };
    const conflict = url.searchParams.get("on_conflict");
    const existing = conflict
      ? rows.find((r) => conflict.split(",").every((k) => r[k] === incoming[k]))
      : null;
    if (existing) Object.assign(existing, input);
    else rows.push(incoming);
    return send(
      req.headers.accept?.includes("vnd.pgrst.object")
        ? existing || incoming
        : [existing || incoming],
      201,
    );
  }
  if (req.method === "PATCH") {
    const found = rows.filter(matches);
    found.forEach((row) => Object.assign(row, input));
    return send(
      req.headers.accept?.includes("vnd.pgrst.object") ? found[0] : found,
    );
  }
  if (req.method === "DELETE") {
    tables[table] = rows.filter((row) => !matches(row));
    return send(null);
  }
  send({ message: "Unhandled test request" }, 404);
});
server.listen(54329, "127.0.0.1");
