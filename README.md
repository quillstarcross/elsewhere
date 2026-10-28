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

## Run locally

This is a static HTML application. You can open `index.html` in a modern browser, though the 3D module import may work best through a local web server.

For example, with Node.js installed:

```bash
npx serve .
```

## Deploy the frontend

Import this repository into Vercel. It is a static site with no build command; use the repository root as the output directory. The app imports Three.js from a public CDN.

## Product direction

ELSEWHERE's primary product is an interactive world-building and simulation environment. Users describe an imagined place, generate a starting world, explore its 3D scene, edit structures, issue world commands, and experiment with how a civilization changes over time. The long-term goal is to make imagined worlds tangible and internally consistent, not merely to render decorative scenes.

### Core product comes first

1. **World creation:** turn a user's description into a world with an environment, infrastructure, and starting conditions.
2. **World editing:** add, remove, and select structures; save, restore, import, and export worlds.
3. **World simulation:** make time and world commands produce visible changes in energy, knowledge, population, and other systems.
4. **Intelligent world-building:** later connect a server-side AI to interpret richer instructions and help users design and evolve their worlds.
5. **Persistent and shared worlds:** later add secure cloud saves and multi-user collaboration.

### Optional future extension: robotics simulation

A separate, optional robotics/simulation extension may eventually let researchers use suitable ELSEWHERE environments to train and evaluate robots in virtual settings. This is inspired by the broader idea of AI world models and simulated environments, including work associated with World Labs and Fei-Fei Li. It is **not the core product** and should not distract from building the world-creation and civilization-simulation experience first. When pursued, it should be a modular extension with explicit interfaces for simulated objects, actions, observations, physics, and training integrations rather than tightly coupling robotics code to the main application.

## AI and future milestones

The current world guide runs locally and summarizes the active simulation. It does not call a live AI model. Future milestones include a secure server-side AI integration, cloud persistence, multi-user worlds, richer simulation systems, and eventual AR/VR exploration.

Never put API keys in frontend code or commit secrets to GitHub.

## Scope and honesty

This is an early interactive prototype, not a finished virtual-reality platform or a scientifically validated civilization simulator. It does not yet provide multi-user worlds, real-world physics, VR/AR support, or persistent cloud accounts. The energy and knowledge indicators are illustrative, not scientific predictions.

## Project

- App title: ELSEWHERE — World Engine
- Version: 0.1.0
- License: not yet specified
