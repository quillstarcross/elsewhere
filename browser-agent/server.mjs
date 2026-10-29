import express from "express";
import crypto from "node:crypto";
import net from "node:net";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright-core";

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const accessKey = process.env.AGENT_ACCESS_KEY;
const binaryPath = process.env.LIGHTPANDA_BIN || path.join(here, "bin", "lightpanda");
const sessions = new Map();
const MAX_SESSIONS = 3;
const SESSION_TTL_MS = 15 * 60 * 1000;
const MAX_TEXT = 8000;
let browser = null;
let browserProcess = null;
let browserError = null;

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(here, "public")));

function authorized(req, res, next) {
  if (!accessKey) return res.status(503).json({ error: "Service setup incomplete: AGENT_ACCESS_KEY is not configured." });
  const supplied = req.get("x-agent-key") || "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(accessKey);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Access key is incorrect." });
  }
  next();
}

function validPublicHttpUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
    if (host === "metadata.google.internal" || host === "metadata") return false;
    if (net.isIP(host) === 4) {
      const [a, b] = host.split(".").map(Number);
      if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
      if (a === 169 && b === 254) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
    }
    if (net.isIP(host) === 6 && (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:") || host.startsWith("::ffff:127.") || host.startsWith("::ffff:10.") || host.startsWith("::ffff:192.168."))) return false;
    return true;
  } catch {
    return false;
  }
}

function requireBrowser(res) {
  if (!browser) {
    res.status(503).json({
      error: browserError
        ? "Lightpanda could not start. Check the service logs and redeploy."
        : "Lightpanda is starting. Wait a few seconds and retry."
    });
    return false;
  }
  return true;
}

function getSession(id) {
  const session = sessions.get(id);
  if (!session) return null;
  session.lastUsedAt = Date.now();
  return session;
}

async function inspectPage(page) {
  return {
    url: page.url(),
    title: await page.title().catch(() => ""),
    text: String(await page.locator("body").innerText({ timeout: 5000 }).catch(() => "")).slice(0, MAX_TEXT),
    links: await page.locator("a[href]").evaluateAll(nodes => nodes.slice(0, 80).map(a => ({
      text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 180),
      href: a.href
    }))).catch(() => [])
  };
}

async function applyAction(page, step) {
  const action = String(step?.action || "");
  const selector = typeof step?.selector === "string" ? step.selector.trim() : "";
  if (action === "navigate") {
    const url = String(step?.url || "").trim();
    if (!validPublicHttpUrl(url)) throw new Error("Use a public http:// or https:// URL. Local/private IP addresses are blocked.");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    return { action, ...(await inspectPage(page)) };
  }
  if (action === "inspect") return { action, ...(await inspectPage(page)) };
  if (!selector || selector.length > 300) throw new Error("Provide a CSS selector of 1–300 characters.");
  if (action === "click") {
    await page.locator(selector).first().click({ timeout: 10000 });
  } else if (action === "fill" || action === "type") {
    const value = step?.value;
    if (typeof value !== "string" || value.length > 2000) throw new Error("Text must be a string of at most 2,000 characters.");
    const locator = page.locator(selector).first();
    const inputType = await locator.getAttribute("type").catch(() => null);
    if (inputType === "password") throw new Error("For safety, password fields cannot be filled through this API. Use an authorized sign-in flow outside this headless browser.");
    await locator.fill(value, { timeout: 10000 });
  } else if (action === "select") {
    const value = step?.value;
    if (typeof value !== "string" || value.length > 500) throw new Error("Select value must be a string of at most 500 characters.");
    await page.locator(selector).first().selectOption(value, { timeout: 10000 });
  } else {
    throw new Error("Supported actions: navigate, click, fill, select, inspect.");
  }
  return { action, ...(await inspectPage(page)) };
}

app.get("/health", (_req, res) => res.json({
  ok: true,
  service: "ELSEWHERE Lightpanda Agent",
  browser: browser ? "ready" : browserError ? "error" : "starting",
  engine: "Lightpanda",
  activeSessions: sessions.size
}));

app.get("/api/status", authorized, (_req, res) => res.json({
  service: "ELSEWHERE Lightpanda Agent",
  browser: browser ? "ready" : browserError ? "error" : "starting",
  engine: "Lightpanda",
  capabilities: ["navigate", "inspect", "click", "fill", "select", "workflow"],
  limitations: ["headless only", "no visual login handoff", "partial browser API compatibility"]
}));

app.post("/api/session", authorized, async (req, res) => {
  if (!requireBrowser(res)) return;
  if (sessions.size >= MAX_SESSIONS) return res.status(429).json({ error: "Session limit reached. Close a session and retry." });
  const targetUrl = String(req.body?.url || "").trim();
  if (!validPublicHttpUrl(targetUrl)) return res.status(400).json({ error: "Enter a public http:// or https:// URL. Local/private IP addresses are blocked." });
  let context;
  try {
    context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    const id = crypto.randomUUID();
    sessions.set(id, { context, page, createdAt: Date.now(), lastUsedAt: Date.now() });
    res.json({ id, engine: "Lightpanda", message: "Headless browser session ready. Inspect the page or run actions below.", ...(await inspectPage(page)) });
  } catch (error) {
    if (context) await context.close().catch(() => {});
    console.error("Could not start Lightpanda session:", error?.message || error);
    res.status(502).json({ error: "Could not open that page with Lightpanda. The site may use unsupported browser features; try a simpler page or use its API." });
  }
});

app.get("/api/session/:id", authorized, async (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found or expired. Start a new session." });
  try {
    res.json({ id: req.params.id, ...(await inspectPage(session.page)) });
  } catch (error) {
    console.error("Could not inspect session:", error?.message || error);
    res.status(502).json({ error: "The browser could not inspect this page. Try again or start a new session." });
  }
});

app.post("/api/session/:id/action", authorized, async (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found or expired. Start a new session." });
  try {
    const result = await applyAction(session.page, req.body || {});
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(400).json({ error: String(error?.message || "Action failed.") });
  }
});

app.post("/api/session/:id/workflow", authorized, async (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found or expired. Start a new session." });
  const steps = req.body?.steps;
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > 20) {
    return res.status(400).json({ error: "Provide between 1 and 20 workflow steps." });
  }
  const results = [];
  for (let i = 0; i < steps.length; i++) {
    try {
      results.push({ step: i + 1, ok: true, result: await applyAction(session.page, steps[i]) });
    } catch (error) {
      results.push({ step: i + 1, ok: false, error: String(error?.message || "Step failed.") });
      return res.status(207).json({ ok: false, stoppedAt: i + 1, results });
    }
  }
  res.json({ ok: true, results });
});

app.delete("/api/session/:id", authorized, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (session) {
    sessions.delete(req.params.id);
    await session.context.close().catch(() => {});
  }
  res.json({ ok: true, message: "Session closed." });
});

const server = app.listen(port, "0.0.0.0", () => console.log(`ELSEWHERE Lightpanda Agent listening on ${port}`));

async function startBrowser() {
  try {
    browserProcess = spawn(binaryPath, ["serve", "--host", "127.0.0.1", "--port", "9222"], { stdio: ["ignore", "pipe", "pipe"] });
    browserProcess.stdout.on("data", chunk => console.log("[lightpanda]", String(chunk).trim()));
    browserProcess.stderr.on("data", chunk => console.log("[lightpanda]", String(chunk).trim()));
    browserProcess.on("error", error => {
      browserError = error;
      console.error("Lightpanda process error:", error?.message || error);
    });
    let lastError;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (browserProcess.exitCode !== null) throw new Error("Lightpanda exited before its CDP server became ready.");
      try {
        browser = await chromium.connectOverCDP({ endpointURL: "ws://127.0.0.1:9222", timeout: 1500 });
        console.log("Lightpanda CDP browser ready.");
        return;
      } catch (error) {
        lastError = error;
        await delay(500);
      }
    }
    throw lastError || new Error("Timed out waiting for Lightpanda CDP.");
  } catch (error) {
    browserError = error;
    console.error("Lightpanda startup failed:", error?.message || error);
  }
}
startBrowser();

const cleanupTimer = setInterval(async () => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastUsedAt > SESSION_TTL_MS) {
      sessions.delete(id);
      await session.context.close().catch(() => {});
    }
  }
}, 60_000);
cleanupTimer.unref();

async function shutdown() {
  clearInterval(cleanupTimer);
  for (const session of sessions.values()) await session.context.close().catch(() => {});
  sessions.clear();
  if (browser) await browser.close().catch(() => {});
  if (browserProcess) {
    browserProcess.stdout?.destroy();
    browserProcess.stderr?.destroy();
    browserProcess.kill();
  }
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
