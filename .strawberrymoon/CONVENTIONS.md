# Code Conventions — Snake Game

## Stack & Tools
- **Language**: Vanilla JavaScript (ES5/ES6), no framework, no bundler
- **Markup**: Single HTML file (`index.html` at repo root)
- **Styling**: Inline `<style>` block using CSS custom properties (`--bg`, `--accent`, etc.)
- **Canvas**: HTML5 Canvas 2D API for all game rendering
- **Storage**: `localStorage` for theme persistence (`snake-theme` key)
- **Server**: None required — open `index.html` directly in a browser
- **Tests**: Playwright (`tests/theme.spec.js`) — run with `npm test` from repo root

## Directory Structure
```
/
├── index.html           # Entire game: markup + styles + JS in one file
├── package.json         # Test runner only (@playwright/test)
├── playwright.config.js # Playwright configuration
├── tests/
│   └── theme.spec.js    # Acceptance tests for theming system
├── .strawberrymoon/     # Agent definitions and project conventions
└── docs/                # StrawberryMoon planning documents
```

## 1. Theme Definitions
All themes live in the `THEMES` object in `index.html`:
- Each key is a slug (e.g. `'ocean-blue'`) matching the `<option value="">` in the HTML
- Each theme has: `name`, `bg`, `gameBg`, `gridDot`, `accent`, `food`, `text`, `textMuted`, `snakeHead`, `snakeGrad(t)`
- `snakeGrad(t)` is a function receiving a 0–1 fraction and returning a CSS colour string

When adding a theme, add an entry to `THEMES` and a matching `<option>` in `#theme-select`.

## 2. Applying Themes
Use `applyTheme(key)` — it:
1. Sets `currentTheme` to the new theme object
2. Writes all CSS custom properties via `document.documentElement.style.setProperty`
3. Persists `key` to `localStorage`
4. Calls `draw()` immediately to repaint the canvas

Never mutate `currentTheme` directly. Always go through `applyTheme()`.

## 3. Canvas Rendering
- `draw()` reads exclusively from `currentTheme` — no hardcoded colours in render code
- Game-over flash uses `ctx.globalAlpha` for transparency; restore to `1` immediately after
- Reset `ctx.shadowBlur` to `0` after every glow draw to avoid bleed-through

## 4. State Management
All game state is held in module-level `var` declarations:
- `snake`, `dir`, `next`, `food`, `score`, `best`, `running`, `loop`
- `currentTheme` — set by `applyTheme()`, read by `draw()`
- Theme is initialised by the `bootstrap()` IIFE at the bottom of the script

## 5. localStorage Keys
| Key            | Values                                           |
|----------------|--------------------------------------------------|
| `snake-theme`  | Any key present in `THEMES` (e.g. `ocean-blue`) |

## 6. WCAG AA Requirements
All themes must meet WCAG AA contrast:
- **Text on background**: ≥ 4.5:1
- **Graphics/UI elements on background**: ≥ 3:1 (accent, food colours)

Verify new themes using the Playwright WCAG test in `tests/theme.spec.js`.

## 7. Performance Budget
- Theme switch (including canvas redraw) must complete in < 5 ms
- No timers, async work, or DOM layout triggered during `applyTheme()`

## 8. No Build Step
There is no compile, transpile, or bundle step for the game itself.
Avoid ES module syntax (`import`/`export`) in `index.html` — it must open as a plain file.
