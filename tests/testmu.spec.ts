import { test, expect } from '@playwright/test';

test.describe('TestMu AI Selenium Playground Scenarios', () => {
  const baseURL = 'https://www.testmuai.com/selenium-playground/';

  // Reliable page load for both headed (local) and headless (HyperExecute)
  async function waitForPage(page: any) {
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await page.waitForLoadState('load', { timeout: 60000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch {
      // networkidle not guaranteed in headless CI — safe to continue
    }
  }

  test('Scenario 1: Simple Form Demo', async ({ page }) => {
    // 1. Open TestMu AI Selenium Playground
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Simple Form Demo" — use href-based locator, more stable than role
    await page.locator('a[href*="simple-form-demo"]').click();

    // 3. Validate URL
    await expect(page).toHaveURL(/.*simple-form-demo/);
    await waitForPage(page);

    // 4. String variable
    const message = 'Welcome to TestMu AI';

    // 5. Fill message — try placeholder first, fall back to id/name
    const messageInput = page.locator('#user-message, input[name="input-message"], input[placeholder*="Message"], input[placeholder*="message"]').first();
    await messageInput.waitFor({ state: 'visible', timeout: 30000 });
    await messageInput.fill(message);

    // 6. Click "Get Checked Value"
    await page.locator('button:has-text("Get Checked Value"), input[value*="Get Checked"]').first().click();

    // 7. Validate text
    const messageLocator = page.locator('#message');
    await expect(messageLocator).toHaveText(message, { timeout: 15000 });
  });

  test('Scenario 2: Drag & Drop Sliders', async ({ page }) => {
    // 1. Open page
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Drag & Drop Sliders" — stable href locator
    await page.locator('a[href*="drag-drop-range-sliders"]').click();
    await expect(page).toHaveURL(/.*drag-drop-range-sliders-demo/);
    await waitForPage(page);

    // 3. Locate slider — use broader selectors since class may differ headlessly
    // Target the LAST range input on the page (the "Default value 15" slider)
    const slider = page.locator('input[type="range"]').last();
    const output = page.locator('output#rangeSuccess');

    // 4. Wait for slider to be attached and visible
    await slider.waitFor({ state: 'attached', timeout: 30000 });
    await page.waitForFunction(
      () => {
        const el = document.querySelector('input[type="range"]');
        return el && (el as HTMLElement).offsetWidth > 0;
      },
      { timeout: 30000 }
    );

    // 5. Use keyboard approach — more reliable than mouse drag in headless
    await slider.focus();
    // Set to known start value via JS, then use arrow keys to reach 95
    await page.evaluate(() => {
      const sliders = document.querySelectorAll('input[type="range"]');
      const target = sliders[sliders.length - 1] as HTMLInputElement;
      target.value = '15';
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Press ArrowRight to go from 15 → 95 (80 presses, step=1)
    for (let i = 0; i < 80; i++) {
      await slider.press('ArrowRight');
    }

    // 6. Validate value is 95
    await expect(output).toHaveText('95', { timeout: 15000 });
  });

  test('Scenario 3: Input Form Submit', async ({ page }) => {
    // 1. Open page
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Input Form Submit" — href-based locator
    await page.locator('a[href*="input-form-demo"]').click();
    await expect(page).toHaveURL(/.*input-form-demo/);
    await waitForPage(page);

    // Wait for form to be present
    await page.locator('#name').waitFor({ state: 'visible', timeout: 30000 });

    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();

    // 3. Click Submit without filling anything
    await submitButton.click();

    // 4. Assert browser native validation on name field
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate(
      (element: HTMLInputElement) => element.validationMessage
    );
    expect(validationMessage).toContain('fill');

    // 5. Fill all fields
    await nameInput.fill('John Doe');
    await page.locator('#inputEmail4').fill('john.doe@example.com');
    await page.locator('#inputPassword4').fill('SecurePassword123');
    await page.locator('#company').fill('Deloitte');
    await page.locator('#websitename').fill('https://www.deloitte.com');
    await page.locator('#inputCity').fill('San Francisco');
    await page.locator('#inputAddress1').fill('123 Testing St');
    await page.locator('#inputAddress2').fill('Suite 500');
    await page.locator('#inputState').fill('California');
    await page.locator('#inputZip').fill('94103');

    // 6. Select country
    await page.selectOption('select[name="country"]', { label: 'United States' });

    // 7. Submit
    await submitButton.click();

    // 8. Validate success message
    const successMessage = page.locator('.success-msg');
    await expect(successMessage).toHaveText(
      'Thanks for contacting us, we will get back to you shortly.',
      { timeout: 15000 }
    );
  });
});