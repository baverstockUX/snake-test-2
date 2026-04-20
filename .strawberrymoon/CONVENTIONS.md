# Code Conventions — CADE UI

## Stack & Tools
- **Frontend**: React 18 with Vite (dev/build)
- **Styling**: Tailwind CSS + PostCSS + DaisyUI
- **Build**: Vite with JSX support
- **Server**: Express.js (node server/index.js on port 7420)
- **Font**: JetBrains Mono / Fira Code (monospace)

## Directory Structure
```
cade-ui/src/
  ├── App.jsx           # Main component, 3-column layout
  ├── main.jsx          # Entry point, ReactDOM.render
  ├── index.css         # Tailwind directives + base styles
  ├── lib/              # Shared utilities
  ├── hooks/            # Custom React hooks
  └── components/       # UI components (stateful + layout)
```

## 1. Shared Utilities
Import from `./lib/` for reusable helpers:
- **`lib/colours.js`** → `TOOL_COLOURS`, `STATUS_BADGE`, `VERIFY_COLOURS`, `SEVERITY_COLOURS` + helper functions
  - Use `toolColour(toolName)` for tool→Tailwind mapping
  - Use `statusBadge(status)` for status→DaisyUI badge class
  - Import: `import { toolColour, statusBadge, TOOL_COLOURS, STATUS_BADGE } from '../lib/colours'`

When adding new utilities, create a new file in `lib/` and export named functions or constants.

## 2. Error & Response Patterns
**API errors** are caught and displayed inline in components:
```javascript
try {
  const res = await fetch('/api/endpoint');
  const data = await res.json();
  if (res.ok && data.ok) {
    // success
  } else if (res.status === 409) {
    return 'Specific error message';  // Pass back to caller
  }
  return 'Generic fallback message';
} catch {
  return 'Network or parse error — check server logs';
}
```
- Always check `res.ok` AND `data.ok` before success
- Return error strings for caller to display
- Catch blocks swallow and return fallback message

## 3. State Management
Use `useAppState()` (in `hooks/useAppState.js`) as the single source of truth:
- Fetches `/api/state`, `/api/repo`, `/api/processes` on mount
- Listens to SSE events via `useSSE()` for real-time updates
- Stores: stories, runs, activeRun, activeStory, completedStories, recentFiles, repo, processes, UI flags
- Always destructure from `useAppState()`, don't pass state as props through 3+ levels

## 4. Server-Sent Events (SSE)
`useSSE()` hook in `hooks/useSSE.js` handles connection and auto-reconnect:
- Connects to `/events` endpoint
- Registered event types: `stories_updated`, `run_discovered`, `run_active_changed`, `log_lines`, `verify_updated`, `review_updated`, `active_story_changed`, `repo_changed`, `process_started`, `process_exited`
- Auto-reconnects on error with 3s backoff
- Calls `onReconnect()` on 2nd+ successful connection

## 5. Validation Patterns
Inline validation for form inputs (see `LaunchModal.jsx`):
```javascript
function validateField(field, rawVal) {
  const val = rawVal.trim();
  if (val === '') return '';  // OK if empty (optional field)
  if (field === 'budget') {
    const n = parseFloat(val);
    return (!isNaN(n) && n > 0) ? '' : 'Error message';
  }
  return '';
}
// On blur: setErrors(prev => ({ ...prev, [field]: validateField(field, val) }))
```
- Validate on blur, not on every keystroke
- Return empty string for valid, error message for invalid
- Use `Object.values(errors).some(Boolean)` to check for any errors

## 6. Component Patterns
**File naming**: `ComponentName.jsx` (PascalCase)
**Export**: `export default` for single component per file
**Props**: Destructure in function signature, type via JSDoc if complex
**Hooks**: Use early, call at top level, never inside conditionals
**Styles**: Tailwind classes first, inline styles for computed/dynamic values
**Event handlers**: Prefix with `handle*`, e.g. `handleLaunch`, `handleBlur`, `onCancel`

## 7. Panels & Layout
Panels follow this header pattern (see `App.jsx > PanelHeader`):
- Neural dot indicator (active/inactive)
- Block symbol: `▓ LABEL`
- Optional process label with ▸ separator (active processes only)
- Use `agent-panel` class for styling, `is-active` modifier for active state

## 8. Tailwind & Styling
- Use Tailwind utilities for layout, spacing, text, transitions
- Inline `style` prop for computed/dynamic values (e.g., colors based on state)
- DaisyUI badges: `badge-warning`, `badge-success`, `badge-error`, `badge-info`, `badge-ghost`
- Colour palette for neural UI: cyan-400 (`rgba(0,210,255,*)`), purple/pink, yellow/red accents
- Font size: use `text-xs` (12px), `text-sm` (14px) for UI labels and lists

## 9. Refs for DOM Access
Use `useRef()` for uncontrolled inputs and imperative DOM operations:
```javascript
const budgetRef = useRef(null);
const val = budgetRef.current?.value ?? '';
```
For form capture, always check `ref.current?.value` (optional chaining).

## 10. Resizable Panes
Pattern from `App.jsx` for drag-to-resize:
- Track `dragging` state in `useRef(false)`
- `onMouseDown` → set `dragging=true`, add global `mousemove`/`mouseup` listeners
- On `mouseMove`: calculate delta, update width with `Math.max/min` clamping
- On `mouseUp`: remove listeners, reset cursor, enable text selection

## 11. API Endpoints
All API calls proxy through Vite to `http://localhost:7420` (see `vite.config.js`):
- `/api/state` → GET current application state
- `/api/repo` → GET repository info (`{ root, hasStatusIndex, hasCadeAgent }`)
- `/api/processes` → GET running processes
- `/api/launch` → POST to launch epic (body: `{ epics: [n], budget?: float, model?: string, timeout?: number }`)
- `/events` → EventSource (SSE) for real-time updates

## 12. Code Reuse Rules
**grep before write**: Search existing code for similar patterns before implementing:
```bash
grep -r "handleLaunch\|handleBlur" cade-ui/src/  # Check existing patterns
```
Add new helpers to `lib/` if used in 2+ components. Keep components focused on UI logic.

## 13. File Format
- JSX for UI components and hooks
- JS for pure utility/export files
- CSS: `index.css` (Tailwind directives) only, component styles via Tailwind + inline
- No styled-components, CSS modules, or framework-specific styling solutions

## 14. Development Workflow
```bash
npm run dev      # Vite dev server + Express server concurrently
npm run build    # Vite build → dist/
npm run preview  # Serve built output
npm run server   # Express server only (debugging)
```
- Dev runs on http://localhost:5173 (Vite), proxies `/api` and `/events` to port 7420
- Server runs on port 7420
- Console errors caught and silently swallowed in hooks (try/catch, optional chaining)
