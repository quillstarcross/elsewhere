# ELSEWHERE — AI coding-agent instructions

## Mission
Build ELSEWHERE into a real, usable world-building and civilization simulation. It is not a landing-page-only project. Users should be able to create, explore, edit, simulate, save, and reload worlds, with an embodied-agent/robotics sandbox sharing the same world state.

## User and working constraints
- The project owner is a beginner and primarily works from an Android phone.
- Explain decisions in plain language; do not require the owner to manually edit code when the agent can make the change.
- Prefer free/open-source tools and free tiers. Do not add paid services, API keys, or subscriptions without explicit approval.
- Make small, verifiable changes. Do not redesign or rewrite the whole app without a clear plan and permission.
- Never claim a feature is implemented or tested unless it has actually been tested.
- Never expose secrets in browser JavaScript, committed files, logs, or screenshots.

## Repository map
- Root `index.html`: main ELSEWHERE web application.
- `vercel.json`: Vercel deployment configuration.
- `browser-agent/`: separate browser-agent component. It is not the main application.
- Do not assume Vercel's Root Directory. Preserve the distinction between the root application and browser-agent component.

## Product principles
1. Functional behavior before visual polish.
2. Clear, accessible controls that work on mobile and desktop.
3. World creation must produce editable, structured world state, not just change a title or theme.
4. Simulation rules must be understandable and produce consistent state changes.
5. Label deterministic/scripted robotics demos honestly. Do not describe them as learned AI or physics-accurate unless implemented and validated.
6. Preserve existing working functionality while fixing defects.
7. Keep save/load/export/import robust and provide clear error messages.
8. Keep external AI optional until a provider and secure server-side integration are deliberately selected.

## Required workflow for every coding task
1. Inspect the current code and relevant repository files before editing.
2. State the suspected root cause and the smallest safe fix.
3. Make the smallest coherent change; avoid unrelated formatting or file moves.
4. Run available checks/tests. If browser testing is unavailable, say so explicitly.
5. Inspect the diff and check for accidental changes, broken paths, missing assets, and secrets.
6. Report the commit or pull request, what changed, what was tested, and any remaining manual steps.
7. Never make multiple speculative deployment changes at once. If a deployment breaks, roll back the specific regression before trying another approach.

## Definition of done
A task is not done merely because a page looks good. Verify the relevant behavior, including console/runtime errors where possible, responsive mobile layout, and deployment result where access allows. Distinguish verified results from assumptions.

## Current known architecture
The root application uses a single HTML file with an inline ES module and Three.js imported through an import map. The existing prototype has rule-based world generation, local simulation state, local-browser saves, and scripted rover route playback. Treat these as prototype capabilities, not a finished AI-powered simulation.
