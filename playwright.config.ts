import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  // The directory where your test files are located.
  testDir: './tests',

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Give failing tests 2 retries on CI, but 0 retries locally for faster feedback.
  retries: process.env.CI ? 2 : 0,

  // Use a limited number of workers on CI.
  workers: process.env.CI ? '100%' : undefined,
  
  // Set a global timeout for each test case (45 seconds).
  timeout: 45 * 1000, 
  expect: {
    // Set a timeout for assertions (10 seconds).
    timeout: 10000, 
  },

  // *** CRITICAL FIX FOR "NO SCENARIOS" ***
  // Define all reporters here. This guarantees the JUnit file is always created.
  reporter: [
    ['list'], // Prints a simple list of tests to the console log.
    ['junit', { outputFile: 'playwright-report/results.xml' }], // For HyperExecute UI.
    ['html', { open: 'never' }] // For the downloadable artifact zip.
  ],

  use: {
    // The correct, live URL for the playground.
    baseURL: 'https://www.lambdatest.com/selenium-playground/',

    // Always run headless on CI/CD environments.
    headless: true, 

    // Standard CI settings for collecting artifacts on failure.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // The output directory for traces, videos, and screenshots.
  outputDir: 'test-results/',
});
