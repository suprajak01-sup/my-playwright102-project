import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration File
 * Optimized for local runs and HyperExecute grid integration.
 */
export default defineConfig({
  // Directory where your test files are located
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI (HyperExecute) to handle flaky tests; don't retry locally for faster feedback
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI if needed, otherwise let Playwright auto-detect
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporter configuration:
   * Generates an HTML report and a JUnit XML report.
   * This is critical so HyperExecute's 'Artifacts Management' can bundle these files.
   */
  reporter: [
    ['html', { open: 'never' }], // Generates local HTML reports without auto-opening a browser tab
    ['junit', { outputFile: 'playwright-report/results.xml' }] // Standard JUnit XML report for dashboard integration
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'https://www.testmuai.com/selenium-playground',

    // Browser setup
    // When executing 'npx playwright test --headed', 'headless' will automatically be overridden to false.
    // If you are stuck in a non-GUI env (e.g. WSL/CI), Playwright defaults to headless: true.
    headless: process.env.CI ? true : false,

    // Collect trace when retrying a failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',

    // Capture screenshots of failed steps to attach to your HyperExecute execution artifacts
    screenshot: 'only-on-failure',

    // Record videos of failed tests for visual debugging
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Standard viewport for desktop browsers
        viewport: { width: 1280, height: 720 },
      },
    },
    // Uncomment these if you want to expand local coverage later:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',
});
