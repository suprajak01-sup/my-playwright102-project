import { test, expect } from '@playwright/test';

// Use test.beforeEach so this happens for every single test in the file, on every browser
test.beforeEach(async ({ page }, testInfo) => {
  // Combine the scenario title and the browser name for a perfect dashboard label
  // Example: "Simple Form Demo - Chrome:Win10"
  const dashboardName = `${testInfo.title} - ${testInfo.project.name}`;

  // THIS IS THE FIX: Tell LambdaTest to rename the current active session
  await page.evaluate((name) => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestName', name: dashboardName })}`);
});

test('Simple Form Demo validation', async ({ page }) => {
  // 1. Open the Selenium Playground
  await page.goto('https://www.lambdatest.com/selenium-playground/', { waitUntil: 'domcontentloaded' });

  // 2. Click “Simple Form Demo”
  await page.getByText("Simple Form Demo").click();
  await expect(page).toHaveURL(/.*simple-form-demo/);
  await page.waitForLoadState('networkidle'); 

  const message = "Welcome to TestMu AI";

  // 3. Locate the input field
  const messageInput = page.locator('input#user-message');
  await messageInput.waitFor({ state: 'visible' }); 

  // 4. BRUTE FORCE: Force the value into the input box and trigger the 'input' event
  await messageInput.evaluate((el: HTMLInputElement, val) => {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, message);

   await expect(messageInput).toHaveValue(message);
  // 5. Small pause to let the site register the forced value
  await page.waitForTimeout(5000);

  // 6. Click the button
  const showMessageButton = page.locator('button#showInput');
  await showMessageButton.click();

  // 7. Validate the output text
  const messageOutput = page.locator('p#message');
  await expect(messageOutput).toHaveText(message);
});
