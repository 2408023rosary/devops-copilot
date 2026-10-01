# Nexus — interactive frontend

React + Vite frontend for a DevOps incident investigation workspace. Runs independently in demo mode. Backend integration is optional and documented in `BACKEND_INTEGRATION.md`.

## Start

Use Node.js 22.12+ (validated with Node.js 24).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No API key is needed for the demo.

```sh
npm run build
npm run preview
npm run lint
npm run format
```

Deploy `dist/` with an SPA fallback to `index.html` so direct links work.

## Working page features

| Page      | Functionality                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome   | Animated introduction and navigation into the workspace                                                                                                                                                           |
| Dashboard | Shared live-in-app counts, priority incident navigation, service details dialogs, evidence links, question handoff, refresh                                                                                       |
| Incidents | Search, severity/status filters, sorting, JSON export, incident deep links, status changes, analysis, searchable/downloadable logs, timeline, persistent notes, `/` search shortcut                               |
| Nexus AI  | Separate conversations, attached incident/reference memory, contextual demo replies, suggestions, typing state, Stop, retry, message copying, text export, draft handoff, verified findings saved to Memory       |
| History   | Multiple resumable conversations, search/sort, rename, individual delete, clear all, export, incident timeline links                                                                                              |
| Memory    | Search/filter/sort, record details, attach to a new conversation, export, individual/bulk delete, enable/pause                                                                                                    |
| Settings  | Effective preferences, automatic analysis on opening incidents, evidence visibility, persistence for new chats, success notifications, animation toggle, workspace export, confirmed data clearing and demo reset |

Incident changes, chats, memories, and preferences share one workspace state. Demo data survives reloads in the same browser. New session-only chats are excluded from persistent storage. Browser storage restrictions produce a visible notice.

## Animations and accessibility

- Page and section entry, staggered cards, card/button hover feedback.
- Chat message entry, typing dots, loading skeletons and spinners.
- Dialog and toast entry, switch and tab transitions, welcome glow.
- Device reduced-motion settings always win. Animations can also be disabled in Settings.
- Keyboard-operable controls, explicit input labels, native modal focus containment/Escape dismissal/focus return, skip navigation, visible focus, and status/error announcements.

Animations use CSS and native browser APIs; no animation runtime is needed.

## Code map

- `src/data/demo.js`: initial sample data and preference defaults.
- `src/services/api.js`: async demo adapter and HTTP integration boundary.
- `src/state/WorkspaceProvider.jsx`: shared workspace, mutations, refresh and notifications.
- `src/components/UI.jsx`: reusable controls, dialogs, empty/error/loading states.
- `src/Functionality.css`: interactive components and motion.
- `src/App.css`, `src/Sidebar.css`, `src/Dashboard.css`, `src/Refinements.css`: existing visual foundation and responsive styling.
- `src/services/download.js`: file export and date formatting.

## Browser checks

```sh
npx playwright install chromium
npm run test:browser
npm run test:api
```

Tests launch their own local Vite servers on ports 4175 and 4176. An optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable points at an existing Chromium executable.

The browser checks cover meaningful workflow changes, persistence, cancellation/retry, multiple conversations, memory reuse, settings, exports, confirmations, navigation, responsive widths (320/390/768/1440), and reduced motion. HTTP-mode tests mock server responses and exercise errors and retries.

## Scope

This is a frontend deliverable. Demo AI replies and telemetry are simulated and labeled. The app does not monitor real infrastructure, run a model, implement authentication, perform vector similarity search, or execute fixes. Connect your backend using the supplied adapter contract when those services are ready. Preferences apply to this workspace; there are no OS push notifications or background polling.

Screenshots and an actual UI interaction video (`previews/interaction-preview.mp4`) are included in `previews/`. The previous prototype remains available in the earlier ZIP; this version uses a new demo storage key.
