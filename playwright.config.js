import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  use: {
    // Open index.html directly — no web server required
    baseURL: 'file://' + __dirname + '/',
  },
});
