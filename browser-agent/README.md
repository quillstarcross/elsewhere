# ELSEWHERE Lightpanda Agent

A small, self-hosted headless browser automation service. This replaces the Browserless dependency in the original prototype with the open-source Lightpanda browser and Playwright's CDP client.

## What it can do

- Open public HTTP/HTTPS pages and execute supported page JavaScript.
- Inspect page title, visible text, and a bounded list of links.
- Run explicit navigation, click, fill, dropdown-select, and inspect actions.
- Execute short, ordered workflows through `POST /api/session/:id/workflow`.
- Protect the API with a server-side `AGENT_ACCESS_KEY`.

The service includes an optional natural-language agent at `POST /api/agent/run`. It calls a configurable OpenAI-compatible chat-completions endpoint, gives the model browser tools plus Tavily web search, runs bounded actions, and returns a report with an action log. Gemini is supported through Google's OpenAI-compatible endpoint. The model API key stays server-side. Lightpanda itself is a browser, not an AI model.

## Important limits

- Lightpanda is headless and has no visual login window or Browserless-style live browser URL. The service intentionally blocks password-field filling. For sites requiring interactive sign-in, use the site's official API/token or a separate browser with a visible login flow; do not paste passwords or cookies into this dashboard.
- Lightpanda implements a subset of browser APIs. Complex sites that depend on Chrome-specific behavior may fail. Use official APIs for GitHub/Vercel operations whenever possible.
- Sessions are in memory and expire after 15 minutes of inactivity. Free web services can sleep or restart, which clears sessions.
- Public URL validation blocks localhost and common private IP literals. This is defense in depth, not a substitute for careful access control.

## Deploy on Render

1. Open Render and create a Blueprint using this repository. Render detects the root `render.yaml` and proposes `elsewhere-browser-agent`.
2. The Blueprint generates `AGENT_ACCESS_KEY`. Keep it private.
3. Deploy and wait until `/health` reports `"browser":"ready"`.
4. Open the service URL and enter the value of `AGENT_ACCESS_KEY` from the Render service environment.
5. Start with a public page such as `https://example.com` to verify the browser.

The build downloads the official open-source Lightpanda binary directly and checks that it runs. No Browserless token, TinyFish wallet, or Lightpanda Cloud token is required.

## API

All `/api/*` endpoints require the `x-agent-key` header.

- `GET /health`: public health status.
- `GET /api/status`: protected capabilities, browser status, and whether AI configuration is present.
- `POST /api/session` with `{"url":"https://example.com"}`: create a headless session.
- `GET /api/session/:id`: inspect title, URL, text, and links.
- `POST /api/session/:id/action`: run one action.
- `POST /api/session/:id/workflow`: run 1–20 ordered steps.
- `DELETE /api/session/:id`: close a session.\n- `POST /api/agent/run` with `{"sessionId":"...","goal":"Find and summarize the public contact information on this page."}`: run the natural-language agent against an existing session. It returns `summary`, `actions`, and `rounds`.

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

Supported browser actions: `navigate`, `click`, `fill`, `select`, and `inspect`. Workflows stop on the first failed step. The AI agent is limited to 8 model/tool rounds per request and uses bounded page output. It is designed for public-page research and routine navigation, not as an unrestricted computer-use agent. It blocks password fields and attempts to stop before consequential actions; this is a safety layer, not a guarantee that every site-specific action will be classified correctly.


## Configure the AI agent

In Render, open the `elsewhere-browser-agent` service and add these environment variables:

- `AI_BASE_URL`: the base URL of an OpenAI-compatible Chat Completions API, without the final `/chat/completions` path.
- `AI_API_KEY`: the model provider's API key. Keep it in Render environment variables only.
- `AI_MODEL`: the exact model identifier supported by that provider.\n- `TAVILY_API_KEY`: optional Tavily Search API key to enable the `search_web` tool. Search is disabled until this is configured.\n- `TAVILY_API_URL`: optional override for the Tavily search endpoint; normally leave unset.

Example base URL shapes include `https://api.openai.com/v1` or a provider's documented OpenAI-compatible endpoint. Choose a model/provider with a free tier if available in your region, but check its current limits and billing terms; free access and quotas can change. Do not put model keys in the dashboard or in GitHub files. After saving environment variables, redeploy/restart the service.

Then open the dashboard, start a session on a public page, enter a goal in **03 / AI agent**, and select **Run AI agent**. Or call the endpoint directly:

```http
POST /api/agent/run
x-agent-key: YOUR_AGENT_ACCESS_KEY
content-type: application/json

{
  "sessionId": "ID_FROM_POST_API_SESSION",
  "goal": "Find the public contact information on this page and summarize it."
}
```

The agent requires an existing browser session. To enable web research, add `TAVILY_API_KEY` as a Render environment variable. The agent uses Tavily's Search API and opens relevant public results in Lightpanda for verification. It cannot bypass authentication, CAPTCHAs, or site restrictions. It will not fill password fields and is instructed to stop before purchases, payments, sending, publishing, deletion, bookings, and final submissions. Review page state before taking consequential actions yourself.

## Local development

From this directory:

```sh
npm install
mkdir -p bin
curl -fsSL --retry 3 https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux -o bin/lightpanda
chmod +x bin/lightpanda
./bin/lightpanda version
npm run check
npm start
```

Set `AGENT_ACCESS_KEY` to a long random value before using the protected API.

## Security

- Never commit API tokens, passwords, cookies, or browser state.
- Do not expose `AGENT_ACCESS_KEY` in frontend code, logs, or public documentation.
- Do not use this service to bypass site authentication, CAPTCHAs, or access controls.
- For account and deployment operations, prefer official APIs and require explicit authorization.
