# ELSEWHERE

**An interface for imagination, world simulation, and embodied AI.**

ELSEWHERE is an interactive world engine for creating imagined environments, developing civilizations, and running embodied agents inside the same worlds. World-building remains the central experience; robotics simulation is integrated as another way to use the environments, not a separate product.

## Current prototype

- Interactive Three.js environment with orbit, zoom, and selectable structures.
- Local world generation from text prompts and starter environments.
- Rule-based world commands that update simulation state.
- Adjustable energy, knowledge, and population indicators (illustrative, not scientific predictions).
- Add and remove structures.
- Save and restore a world in the current browser; import/export portable JSON.
- Responsive interface and local-only world guide fallback.\n- Built-in embodied simulation lab with a virtual rover and inspect, delivery, and survey task demonstrations that run in the active world.

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

### One world engine, multiple kinds of simulation

Robotics and embodied AI are part of ELSEWHERE's long-term product vision, alongside world creation and civilization simulation. They are not a separate product or an afterthought. The same generated environment should be useful both as a world people can explore and as a place where virtual agents can perceive, navigate, manipulate objects, and complete tasks.

The current prototype includes a **basic embodied-simulation lab**: a virtual rover can run deterministic inspect, delivery, and survey routes through structures in the active world. This is an initial demonstration of the product direction, not machine-learning training, validated physics, or a claim that a real robot has been trained.

The long-term goal is to evolve this into a simulation foundation for robotics research: structured world state, collision-aware navigation, physics and sensor models, configurable agent bodies, repeatable scenarios, observation/action interfaces, task scoring, and eventual integrations with training frameworks. The ambition is informed by spatial-intelligence and world-model research associated with World Labs and Fei-Fei Li, while ELSEWHERE retains its own focus: let people create worlds, then use those same worlds to explore ideas, simulate systems, and develop intelligent agents.

## AI and future milestones

The current world guide runs locally and summarizes the active simulation. It does not call a live AI model. Future milestones include a secure server-side AI integration, cloud persistence, multi-user worlds, richer simulation systems, and eventual AR/VR exploration.

Never put API keys in frontend code or commit secrets to GitHub.

## Scope and honesty

This is an early interactive prototype, not a finished virtual-reality platform or a scientifically validated civilization simulator. It does not yet provide multi-user worlds, validated real-world physics, learned robot policies, real-robot deployment, VR/AR support, or persistent cloud accounts. The energy and knowledge indicators are illustrative, not scientific predictions.

## Project

- App title: ELSEWHERE — World Engine
- Version: 0.1.0
- License: not yet specified
