# ELSEWHERE

**An interface for imagination.**

ELSEWHERE is an interactive world-building prototype for creating imagined environments, entering a small 3D simulation, and experimenting with the systems that shape a civilization.

## Current prototype

- Interactive Three.js environment with orbit, zoom, and selectable structures.
- Local world generation from text prompts and starter environments.
- Rule-based world commands that update simulation state.
- Adjustable energy, knowledge, and population indicators (illustrative, not scientific predictions).
- Add and remove structures.
- Save and restore a world in the current browser; import/export portable JSON.
- Responsive interface and local-only world guide fallback.
- Optional Cloudflare Worker backend for AI world-guide responses.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build with `npm run build` and preview it with `npm run preview`.

## Deploy the frontend

Import this repository into Vercel and deploy with the default Vite settings. The build command is `npm run build` and the output directory is `dist`.

## Optional AI guide

The app works without an AI provider, but the world guide is local-only. For open-ended AI responses, deploy the worker in `worker/` using the instructions in `CLOUDFLARE_DEPLOY.md`, configure the provider secret on the server, and set `VITE_AI_ENDPOINT` to the deployed endpoint in Vercel. Never place API keys in frontend code or commit them to GitHub.

## Scope and honesty

This is an early interactive prototype, not a finished virtual-reality platform or a scientifically validated civilization simulator. It does not yet provide multi-user worlds, real-world physics, VR/AR support, or persistent cloud accounts. Those are future directions.

## Project

- App title: ELSEWHERE — World Engine
- Version: 0.1.0
- License: not yet specified
