import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_URL = 'file://' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');

// ── WCAG utilities (pure JS, no browser needed) ──────────────────────────────

function hexToRgb(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) throw new Error('Invalid hex: ' + hex);
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function luminance({ r, g, b }) {
  const lin = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── AC: localStorage persistence ─────────────────────────────────────────────

test('selected theme is saved to localStorage', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.selectOption('#theme-select', 'ocean-blue');
  const saved = await page.evaluate(() => localStorage.getItem('snake-theme'));
  expect(saved).toBe('ocean-blue');
});

test('selecting a different theme updates localStorage', async ({ page }) => {
  await page.goto(FILE_URL);
  await page.selectOption('#theme-select', 'retro-green');
  const saved = await page.evaluate(() => localStorage.getItem('snake-theme'));
  expect(saved).toBe('retro-green');
});

test('persisted theme loads automatically on next session', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('snake-theme', 'retro-green');
  });
  await page.goto(FILE_URL);

  const selected = await page.evaluate(() => document.getElementById('theme-select').value);
  expect(selected).toBe('retro-green');

  // CSS variable should match retro-green bg
  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  );
  expect(bg).toBe('#0a120a');
});

test('unknown persisted theme key falls back to ocean-blue', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('snake-theme', 'not-a-real-theme');
  });
  await page.goto(FILE_URL);

  const selected = await page.evaluate(() => document.getElementById('theme-select').value);
  expect(selected).toBe('ocean-blue');
});

// ── AC: Theme switching during active gameplay ────────────────────────────────

test('theme switch during active game does not reset score', async ({ page }) => {
  await page.goto(FILE_URL);

  // Start the game
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300); // let a couple of ticks pass

  const scoreBefore = await page.evaluate(() => document.getElementById('score').textContent);

  // Switch theme while game is running
  await page.selectOption('#theme-select', 'neon-pink');

  const scoreAfter = await page.evaluate(() => document.getElementById('score').textContent);
  expect(scoreAfter).toBe(scoreBefore);
});

test('theme switch during active game does not show game-over message', async ({ page }) => {
  await page.goto(FILE_URL);

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);

  await page.selectOption('#theme-select', 'monochrome');

  const msg = await page.evaluate(() => document.getElementById('message').textContent);
  // Game is still running — message should be empty (cleared on start)
  expect(msg).toBe('');
});

test('theme switch during active game applies new CSS accent variable', async ({ page }) => {
  await page.goto(FILE_URL);

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);

  await page.selectOption('#theme-select', 'cyberpunk');

  const accent = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  );
  expect(accent).toBe('#f72585'); // cyberpunk accent
});

// ── AC: WCAG AA contrast ratios (Ocean Blue theme) ───────────────────────────
// Verified against https://www.w3.org/TR/WCAG21/#contrast-minimum
// AA: text >= 4.5:1, graphics/UI elements >= 3:1

test('Ocean Blue — text (#e1f5fe) on bg (#061421) meets AA text standard (4.5:1)', () => {
  expect(contrastRatio('#e1f5fe', '#061421')).toBeGreaterThanOrEqual(4.5);
});

test('Ocean Blue — accent (#29b6f6) on bg (#061421) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#29b6f6', '#061421')).toBeGreaterThanOrEqual(3);
});

test('Ocean Blue — food (#ffd54f) on bg (#061421) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#ffd54f', '#061421')).toBeGreaterThanOrEqual(3);
});

// ── AC: WCAG AA contrast ratios — remaining themes ───────────────────────────
// AA: text >= 4.5:1, graphics/UI elements (accent, food) >= 3:1
// Note: short-hand hex (#111) expanded to 6-digit (#111111) for hexToRgb compatibility.

test('Cyberpunk — text (#eeeeee) on bg (#0d0d1a) meets AA text standard (4.5:1)', () => {
  expect(contrastRatio('#eeeeee', '#0d0d1a')).toBeGreaterThanOrEqual(4.5);
});

test('Cyberpunk — accent (#f72585) on bg (#0d0d1a) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#f72585', '#0d0d1a')).toBeGreaterThanOrEqual(3);
});

test('Retro Green — text (#c8ffc8) on bg (#0a120a) meets AA text standard (4.5:1)', () => {
  expect(contrastRatio('#c8ffc8', '#0a120a')).toBeGreaterThanOrEqual(4.5);
});

test('Retro Green — accent (#39ff14) on bg (#0a120a) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#39ff14', '#0a120a')).toBeGreaterThanOrEqual(3);
});

test('Neon Pink — text (#ffe0ff) on bg (#1a0a1e) meets AA text standard (4.5:1)', () => {
  expect(contrastRatio('#ffe0ff', '#1a0a1e')).toBeGreaterThanOrEqual(4.5);
});

test('Neon Pink — accent (#ff10f0) on bg (#1a0a1e) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#ff10f0', '#1a0a1e')).toBeGreaterThanOrEqual(3);
});

test('Monochrome — text (#eeeeee) on bg (#111111) meets AA text standard (4.5:1)', () => {
  expect(contrastRatio('#eeeeee', '#111111')).toBeGreaterThanOrEqual(4.5);
});

test('Monochrome — accent (#ffffff) on bg (#111111) meets AA graphics standard (3:1)', () => {
  expect(contrastRatio('#ffffff', '#111111')).toBeGreaterThanOrEqual(3);
});

// ── AC: Performance — theme switch < 5ms ─────────────────────────────────────

test('applyTheme() completes in under 5ms', async ({ page }) => {
  await page.goto(FILE_URL);

  const elapsed = await page.evaluate(() => {
    const start = performance.now();
    window.applyTheme('monochrome');
    return performance.now() - start;
  });

  expect(elapsed).toBeLessThan(5);
});

test('switching back and forth between themes stays under 5ms each', async ({ page }) => {
  await page.goto(FILE_URL);

  const results = await page.evaluate(() => {
    const times = [];
    const keys = ['cyberpunk', 'retro-green', 'neon-pink', 'ocean-blue', 'monochrome'];
    for (const key of keys) {
      const t0 = performance.now();
      window.applyTheme(key);
      times.push(performance.now() - t0);
    }
    return times;
  });

  for (const ms of results) {
    expect(ms).toBeLessThan(5);
  }
});
