import { defineConfig, devices } from '@playwright/test';
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,     
  retries: 1,               
  workers: 3,               
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    baseURL: process.env.BASE_URL ?? 'https://www.lambdatest.com/selenium-playground/',
    // NO connectOptions here. HyperExecute will handle the bridge.
  },
  projects: [
    {
      name: 'chromium',
      testMatch: '**/*testmu*.spec.ts', 
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
