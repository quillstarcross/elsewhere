# ELSEWHERE Browser Agent

A small remote-browser control service for ELSEWHERE. It creates an interactive hosted Chromium session using Browserless, lets the user complete sign-in directly in the live browser, and then allows explicit navigation, click, type, and page-inspection actions.

## Important distinction

This is a working starter for **human-assisted browser automation**, not a fully autonomous AI agent. It does not infer a natural-language goal or decide which actions to take. Those capabilities can be added later.

## Deploy on Render

1. Create a free Browserless account at https://cloud.browserless.io/sign-up (no payment card is required on the published free plan). Copy the API token from its dashboard. Do not put the token in GitHub or in browser-side JavaScript.
2. Open https://render.com and sign in. Choose **New → Blueprint** and connect the `quillstarcross/elsewhere` repository. Render should detect the root `render.yaml` file and propose the `elsewhere-browser-agent` service.
3. During setup, enter the secret values requested by Render:
   - `BROWSERLESS_TOKEN`: your Browserless API token.
   - `AGENT_ACCESS_KEY`: create a long, unique secret used to protect the dashboard API. Do not reuse your account password.
4. Deploy. Open the Render service URL when the deployment finishes. The `/health` path should return a small JSON status message.
5. On the dashboard, enter the same `AGENT_ACCESS_KEY`, then enter a website URL and start a session. Open the interactive browser link, sign in there yourself, and return to the dashboard to inspect the page or run explicit actions.

## Free-plan limits

Browserless's published free plan includes 1,000 units per month and a **2-minute maximum session time**. A unit is generally up to 30 seconds of browser connection time. Treat this as a short proof of concept, not an unlimited service. If a session expires, start a new one.

Render's free web services can sleep and have ephemeral in-memory state. If the service restarts, its session map is lost. This starter is intended for short interactive sessions; it does not guarantee persistent browser sessions across restarts.

## Safety

- Never commit API tokens, passwords, cookies, session files, or Browserless live URLs.
- The live URL is a bearer secret: anyone who has it may be able to control the authenticated browser. Keep it private.
- Enter passwords, one-time codes, and consent directly in the interactive browser. Do not send credentials to the action form or the assistant.
- Use this only with accounts and websites you are authorized to access. Respect each website's terms and verification requirements.
- The service requires a private `AGENT_ACCESS_KEY`; do not deploy it with that value missing.

## Local development

From this directory:

```sh
npm install
BROWSERLESS_TOKEN=your_token AGENT_ACCESS_KEY=your_private_key npm start
```

Then open http://localhost:3000.

## Reference

- Browserless live browser sessions: https://docs.browserless.io/overview/getting-started/create-a-browser-session
- Playwright authentication guidance: https://playwright.dev/docs/auth
