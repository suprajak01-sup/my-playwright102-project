import { defineConfig, devices } from '@playwright/test';
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Playwright configuration for HyperExecute.
 * This file is now simplified to let HyperExecute manage everything.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 180_000,          // per-test timeout
  expect: { timeout: 15_000 },
  fullyParallel: true,     
  retries: 1,               
  workers: 3, // Playwright will manage workers inside the HyperExecute machine.
              
  reporter: [
    ['list'],
    // This generates the XML file that the HyperExecute 'reports' block needs.
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    // Capture artifacts for the HyperExecute dashboard.
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    // Use the correct, live URL.
    baseURL: 'https://www.lambdatest.com/selenium-playground/',
    
    // --- THIS IS THE FIX ---
    // We are REMOVING the 'connectOptions' block entirely.
    // This tells Playwright to use the local browser inside the HyperExecute VM,
    // which breaks the deadlock.
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /.*testmu.*\.spec\.ts/, 
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
