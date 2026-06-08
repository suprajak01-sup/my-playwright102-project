import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for HyperExecute.
 *
 * • Runs on chromium only (HyperExecute matrix handles OS splitting).
 * • Videos, screenshots and traces are always captured so HyperExecute
 *   Artifacts Management can collate them into a single downloadable zip.
 * • Timeouts are generous to survive headless CI network latency.
 * • NODE_ENV and PROJECT_NAME are injected via HyperExecute env: block
 *   and are readable here via process.env.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,          // per-test timeout
  expect: { timeout: 15_000 },
  fullyParallel: false,     // HyperExecute handles parallelism at the job level
  retries: 1,               // one retry per test inside the runner
  workers: 1,               // single worker per HyperExecute task
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],

  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    // Capture everything — required for Artifacts Management
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    // Base URL can be overridden by env var if needed
    baseURL: process.env.BASE_URL ?? 'https://www.testmuai.com',
    // Secret token available in test via process.env.MY_SECRET_TOKEN
    // (injected by HyperExecute Secrets Management)
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'test-results',
});
