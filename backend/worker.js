/* backend/worker.js — Triniti donation details endpoint.
 *
 * One file, Cloudflare Workers runtime only: no imports, no npm, no wrangler.toml.
 * Paste the whole file into the Cloudflare dashboard editor (see docs/BACKEND-SETUP.md).
 *
 * Bindings this file expects (Settings -> Variables and Storage -> KV):
 *   DONATIONS       KV namespace      required
 *   SALT            secret string     required; the IP hash salt
 *   ALLOWED_ORIGIN  string            required; e.g. https://demons00041-bit.github.io
 *   ADMIN_TOKEN     secret string     optional; when set, enables GET /donations export
 *
 * Endpoints:
 *   OPTIONS *        -> 204 + CORS preflight headers
 *   POST    /donations -> 201 {ok:true,ref} | 400 | 429 | 500
 *   GET     /donations -> export, only while ADMIN_TOKEN is set and the token matches
 *
 * What this file deliberately does NOT do: it never stores a raw IP, it accepts no field
 * beyond the ones documented in docs/REDESIGN-PLAN.md 12.4, and it never writes anything
 * at all for an anonymous submission.
 */

var RATE_LIMIT = 5;
var RATE_WINDOW_SECONDS = 3600;
var MAX_EMAIL = 254;
var MAX_NAME = 120;
var MAX_MESSAGE = 1000;
var MAX_PHONE = 40;
var MAX_AMOUNT = 100000;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    var cors = corsHeaders(env);
    try {
      var url = new URL(request.url);
      var path = url.pathname.replace(/\/+$/, "") || "/";
      var method = request.method.toUpperCase();

      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }
      if (path === "/donations" && method === "POST") {
        return await handleDonation(request, env, cors);
      }
      if (path === "/donations" && method === "GET") {
        return await handleExport(request, env, cors);
      }
      return json(404, { ok: false, error: "notfound" }, cors);
    } catch (err) {
      /* Still CORS-complete: without these headers the browser reports a CORS
       * failure and the operator never sees this message. */
      return json(500, { ok: false, error: "server" }, cors);
    }
  }
};

/* ---------- POST /donations ---------- */

async function handleDonation(request, env, cors) {
  var body = {};
  try {
    body = await request.json();
  } catch (err) {
    body = {};
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) body = {};

  /* 1. Anonymous = zero retention, enforced server-side. A normal front end never
   * sends this request at all; receiving it means it was built by hand. Refused
   * before the rate counter is touched and before any KV put. */
  if (body.anonymous === true) {
    return json(400, { ok: false, error: "anonymous" }, cors);
  }

  /* 2. Bot trap: look successful, store nothing, spend no quota. */
  if (typeof body.hp === "string" && body.hp !== "") {
    return json(201, { ok: true, ref: makeRef(new Date()) }, cors);
  }

  /* 3. Config guard: refuse rather than write a record we cannot hash. */
  if (!env || !env.SALT || !env.DONATIONS) {
    return json(500, { ok: false, error: "config" }, cors);
  }

  /* 4. Server-side validation. Never trust the client. */
  var bad = validate(body);
  if (bad) return json(400, { ok: false, error: bad }, cors);

  /* 5. Hash the IP immediately; the raw value is never stored or logged. */
  var ip = request.headers.get("CF-Connecting-IP") || "unknown";
  var ipHash = await hashIp(ip, env.SALT);

  /* 6. Rate limit, counted only for requests that would actually be stored. */
  var allowed = await takeRateSlot(env, ipHash);
  if (!allowed) return json(429, { ok: false, error: "rate" }, cors);

  /* 7. Store. */
  var now = new Date();
  var ref = makeRef(now);
  var amount = body.amount === undefined ? null : body.amount;
  var record = {
    ref: ref,
    amount: amount,
    currency: str(body.currency, 8),
    name: str(body.name, MAX_NAME),
    email: str(body.email, MAX_EMAIL),
    phone: str(body.phone, MAX_PHONE),
    message: str(body.message, MAX_MESSAGE),
    locale: str(body.locale, 8),
    ua: str(request.headers.get("User-Agent"), 300),
    ip_hash: ipHash,
    created_at: now.toISOString()
  };

  var key = "donation:" + now.toISOString() + ":" + randomHex(4);
  await env.DONATIONS.put(key, JSON.stringify(record));

  return json(201, { ok: true, ref: ref }, cors);
}

function validate(body) {
  var email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) return "email";

  if (typeof body.name === "string" && body.name.length > MAX_NAME) return "name";
  if (typeof body.message === "string" && body.message.length > MAX_MESSAGE) return "message";

  if (body.amount !== null && body.amount !== undefined) {
    if (typeof body.amount !== "number" || !isFinite(body.amount)) return "amount";
    if (body.amount < 0 || body.amount > MAX_AMOUNT) return "amount";
  }

  if (!body.agree) return "agree";
  return "";
}

async function takeRateSlot(env, ipHash) {
  var bucket = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  var key = "rl:" + ipHash + ":" + bucket;
  var used = parseInt((await env.DONATIONS.get(key)) || "0", 10);
  if (!isFinite(used) || used < 0) used = 0;
  if (used >= RATE_LIMIT) return false;
  await env.DONATIONS.put(key, String(used + 1), { expirationTtl: RATE_WINDOW_SECONDS });
  return true;
}

async function hashIp(ip, salt) {
  var bytes = new TextEncoder().encode(ip + salt);
  var digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest)).slice(0, 16);
}

/* ---------- GET /donations (export, off unless ADMIN_TOKEN is set) ---------- */

async function handleExport(request, env, cors) {
  if (!env || !env.ADMIN_TOKEN) return json(404, { ok: false, error: "notfound" }, cors);
  if (!env.DONATIONS) return json(500, { ok: false, error: "config" }, cors);

  var url = new URL(request.url);
  var header = request.headers.get("Authorization") || "";
  var given = header.indexOf("Bearer ") === 0 ? header.slice(7).trim() : "";
  if (!given) given = url.searchParams.get("token") || "";
  if (!safeEqual(given, env.ADMIN_TOKEN)) {
    return json(401, { ok: false, error: "unauthorized" }, cors);
  }

  var records = [];
  var cursor = undefined;
  var pages = 0;
  while (pages < 20) {
    var listing = await env.DONATIONS.list({ prefix: "donation:", limit: 1000, cursor: cursor });
    var keys = listing.keys || [];
    for (var i = 0; i < keys.length; i++) {
      var raw = await env.DONATIONS.get(keys[i].name);
      if (!raw) continue;
      try {
        records.push(JSON.parse(raw));
      } catch (err) {
        /* one unreadable value must not fail the whole export */
      }
    }
    if (listing.list_complete || !listing.cursor) break;
    cursor = listing.cursor;
    pages += 1;
  }

  return json(200, { ok: true, count: records.length, records: records }, cors);
}

/* ---------- helpers ---------- */

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": (env && env.ALLOWED_ORIGIN) || "",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(status, payload, cors) {
  var headers = new Headers(cors);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload), { status: status, headers: headers });
}

function str(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function makeRef(date) {
  var ymd = String(date.getUTCFullYear()) + pad2(date.getUTCMonth() + 1) + pad2(date.getUTCDate());
  return "DON-" + ymd + "-" + randomHex(2).toUpperCase();
}

function randomHex(byteCount) {
  var bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

function toHex(bytes) {
  var out = "";
  for (var i = 0; i < bytes.length; i++) {
    var h = bytes[i].toString(16);
    out += h.length === 1 ? "0" + h : h;
  }
  return out;
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
