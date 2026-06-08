import { defineConfig, devices } from '@playwright/test';
import * as dotenv from "dotenv";

dotenv.config();

const user = process.env.LT_USERNAME;
const accessKey = process.env.LT_ACCESS_KEY;

if (!user || !accessKey) {
  throw new Error("ERROR: LambdaTest Credentials missing!");
}

// Helper function to bridge the test to the Web Automation Dashboard
const getWsEndpoint = (browserName: string, testName: string) => {
  const capabilities = {
    "browserName": browserName,
    "browserVersion": "latest",
    "LT:Options": {
      // CRITICAL FIX: The Grid requires exact OS strings. 
      // Passing "win" or "linux" causes the infinite queue deadlock.
      "platform": "Windows 10", 
      "build": "Playwright 101 Assignment", // Generates the Build on the Dashboard!
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
    
    // Connects Playwright to the Web Automation Grid to generate the dashboard build
    connectOptions: {
      wsEndpoint: getWsEndpoint('Chrome', 'HyperExecute Playwright Execution')
    }
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
