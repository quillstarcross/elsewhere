import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Browserless from "@browserless.io/bap-ts";

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const token = process.env.BROWSERLESS_TOKEN;
const accessKey = process.env.AGENT_ACCESS_KEY;
const endpoint = process.env.BROWSERLESS_ENDPOINT || "wss://production-sfo.browserless.io/chromium/bql";
const sessions = new Map();

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(here, "public")));

app.get("/health", (_req, res) => res.json({ ok: true, service: "ELSEWHERE Browser Agent" }));

function authorized(req, res, next) {
  if (!accessKey) return res.status(503).json({ error: "Server setup incomplete: AGENT_ACCESS_KEY is not configured." });
  const supplied = req.get("x-agent-key") || "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(accessKey);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Access key is incorrect." });
  }
  next();
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

app.post("/api/session", authorized, async (req, res) => {
  if (!token) return res.status(503).json({ error: "Add BROWSERLESS_TOKEN to the service environment first." });
  const targetUrl = String(req.body?.url || "").trim();
  if (!validHttpUrl(targetUrl)) return res.status(400).json({ error: "Enter a complete http:// or https:// website address." });

  let browser;
  try {
    browser = Browserless.connect({ browserWSEndpoint: endpoint, token, timeout: 45000, connectTimeout: 45000 });
    const page = await browser.newPage();
    await page.goto(targetUrl);
    const handoff = await page.liveURL({ interactable: true });
    const id = crypto.randomUUID();
    sessions.set(id, { browser, page, liveURL: handoff.liveURL, createdAt: Date.now() });
    res.json({ id, liveURL: handoff.liveURL, message: "Browser opened. Sign in in the live browser, then return here and select Inspect / Continue." });
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error("Could not start browser session:", error?.message || error);
    res.status(502).json({ error: "Could not start the remote browser. Check the Browserless token and endpoint, then try again." });
  }
});

app.get("/api/session/:id", authorized, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found or this server restarted. Start a new session." });
  try {
    const title = await session.page.title();
    const currentUrl = await session.page.url();
    const body = await session.page.text({ selector: "body" });
    res.json({ id: req.params.id, url: currentUrl, title, text: String(body?.text || "").slice(0, 5000), liveURL: session.liveURL });
  } catch (error) {
    console.error("Could not inspect browser session:", error?.message || error);
    res.status(502).json({ error: "The browser session is no longer available. Start a new session." });
  }
});

app.post("/api/session/:id/action", authorized, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "Session not found. Start a new session." });
  const { action, selector, value, url } = req.body || {};
  try {
    if (action === "navigate") {
      if (!validHttpUrl(String(url || ""))) return res.status(400).json({ error: "Provide a complete http:// or https:// URL." });
      await session.page.goto(String(url));
    } else if (action === "click") {
      if (typeof selector !== "string" || !selector.trim() || selector.length > 300) return res.status(400).json({ error: "Provide a valid CSS selector." });
      await session.page.click(selector);
    } else if (action === "type") {
      if (typeof selector !== "string" || !selector.trim() || selector.length > 300 || typeof value !== "string" || value.length > 2000) return res.status(400).json({ error: "Provide a CSS selector and text (maximum 2,000 characters)." });
      await session.page.type(selector, value);
    } else {
      return res.status(400).json({ error: "Supported actions are navigate, click, and type." });
    }
    res.json({ ok: true, message: "Action completed.", url: await session.page.url(), title: await session.page.title() });
  } catch (error) {
    console.error("Browser action failed:", error?.message || error);
    res.status(502).json({ error: "The action could not be completed. Check the URL or selector and try again." });
  }
});

app.delete("/api/session/:id", authorized, async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.json({ ok: true });
  sessions.delete(req.params.id);
  await session.browser.close().catch(() => {});
  res.json({ ok: true, message: "Browser session closed." });
});

app.listen(port, "0.0.0.0", () => console.log(`ELSEWHERE Browser Agent listening on ${port}`));

process.on("SIGTERM", async () => {
  for (const session of sessions.values()) await session.browser.close().catch(() => {});
  process.exit(0);
});
