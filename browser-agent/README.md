# ELSEWHERE Lightpanda Agent

A small, self-hosted headless browser automation service. This replaces the Browserless dependency in the original prototype with the open-source Lightpanda browser and Playwright's CDP client.

## What it can do

- Open public HTTP/HTTPS pages and execute supported page JavaScript.
- Inspect page title, visible text, and a bounded list of links.
- Run explicit navigation, click, fill, dropdown-select, and inspect actions.
- Execute short, ordered workflows through `POST /api/session/:id/workflow`.
- Protect the API with a server-side `AGENT_ACCESS_KEY`.

This is a browser-control service, not a complete natural-language AI agent by itself. A compatible AI orchestrator can call its API, or a workflow can be sent as explicit steps.

## Important limits

- Lightpanda is headless and has no visual login window or Browserless-style live browser URL. The service intentionally blocks password-field filling. For sites requiring interactive sign-in, use the site's official API/token or a separate browser with a visible login flow; do not paste passwords or cookies into this dashboard.
- Lightpanda implements a subset of browser APIs. Complex sites that depend on Chrome-specific behavior may fail. Use official APIs for GitHub/Vercel operations whenever possible.
- Sessions are in memory and expire after 15 minutes of inactivity. Free web services can sleep or restart, which clears sessions.
- Public URL validation blocks localhost and common private IP ranges. This is defense in depth, not a substitute for careful access control.

## Deploy on Render

1. Open Render and create a Blueprint using this repository. Render detects the root `render.yaml` and proposes `elsewhere-lightpanda-agent`.
2. The Blueprint generates `AGENT_ACCESS_KEY`. Keep it private.
3. Deploy and wait until `/health` reports `"browser":"ready"`.
4. Open the service URL and enter the value of `AGENT_ACCESS_KEY` from the Render service environment.
5. Start with a public page such as `https://example.com` to verify the browser.

The build installs the open-source `@lightpanda/browser` package and its browser binary. No Browserless token, TinyFish wallet, or Lightpanda Cloud token is required.

## API

All `/api/*` endpoints require the `x-agent-key` header.

- `GET /health`: public health status.
- `GET /api/status`: protected capabilities and browser status.
- `POST /api/session` with `{"url":"https://example.com"}`: create a headless session.
- `GET /api/session/:id`: inspect title, URL, text, and links.
- `POST /api/session/:id/action`: run one action.
- `POST /api/session/:id/workflow`: run 1–20 ordered steps.
- `DELETE /api/session/:id`: close a session.

Example action body:

```json
{"action":"click","selector":"a"}
```

Example workflow body:

```json
{
  "steps": [
    {"action":"navigate","url":"https://example.com"},
    {"action":"inspect"}
  ]
}
```

Supported actions: `navigate`, `click`, `fill`, `select`, and `inspect`. Workflows stop on the first failed step. Page text and link output are bounded to avoid unbounded responses.

## Local development

From this directory:

```sh
npm install
npx @lightpanda/browser install
npm run check
npm start
```

Set `AGENT_ACCESS_KEY` to a long random value before using the protected API.

## Security

- Never commit API tokens, passwords, cookies, or browser state.
- Do not expose `AGENT_ACCESS_KEY` in frontend code, logs, or public documentation.
- Do not use this service to bypass site authentication, CAPTCHAs, or access controls.
- For account and deployment operations, prefer official APIs and require explicit authorization.
