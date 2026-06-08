import { defineConfig, devices } from '@playwright/test';
import * as dotenv from "dotenv";

dotenv.config();

const user = process.env.LT_USERNAME;
const accessKey = process.env.LT_ACCESS_KEY;

if (!user || !accessKey) {
  throw new Error("ERROR: LambdaTest Credentials missing!");
}

// Helper function takes the browser, OS, and the EXACT test name you want on the dashboard
const getWsEndpoint = (browserName: string, os: string, testName: string) => {
  const capabilities = {
    "browserName": browserName,
    "browserVersion": "latest",
    "LT:Options": {
      "platform": os,
      "build": "My Playwright HyperExecute Build", // Groups it on the dashboard
      "name": testName, 
      "user": user,
      "accessKey": accessKey,
      "video": true,
      "network": true,
      "console": true,
      "visual": true,
      "tunnel": false,
    },
  };
  return `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`;
};

// Dynamically resolve the OS based on the HyperExecute matrix environment variable
const currentOS = process.env.TARGET_OS === 'win' ? 'Windows 10' : 'Linux';

/**
 * Playwright configuration for HyperExecute.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 180_000,          // per-test timeout
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
    
    // *** THIS WAS MISSING ***
    // This connects Playwright to the LambdaTest Web Automation Grid so a Build is generated!
    connectOptions: {
      wsEndpoint: getWsEndpoint('Chrome', currentOS, 'HyperExecute Test Session')
    }
  },
  projects: [
    {
      name: 'chromium',
      // Fixed escaping logic for valid regex syntax
      testMatch: /.*testmu.*\.spec\.ts/, 
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
