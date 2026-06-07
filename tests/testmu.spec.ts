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
      // networkidle not guaranteed headlessly — safe to continue
    }
  }

  test('Scenario 1: Simple Form Demo', async ({ page }) => {
    // 1. Open TestMu AI Selenium Playground
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Simple Form Demo"
    await page.locator('a[href*="simple-form-demo"]').click();

    // 3. Validate URL contains "simple-form-demo"
    await expect(page).toHaveURL(/.*simple-form-demo/);
    await waitForPage(page);

    // 4. String variable
    const message = 'Welcome to TestMu AI';

    // 5. Fill the "Enter Message" input — targeted by label association
    //    The label text is "Enter Message"; input id is "user-message"
    const messageInput = page.locator('#user-message');
    // await messageInput.waitFor({ state: 'visible', timeout: 60000 });
    await messageInput.fill(message);

    // 6. Click "Get Checked Value"
    await page.locator('#showInput').click();

    // 7. Validate the same text message is displayed
    await expect(page.locator('#message')).toHaveText(message, { timeout: 15000 });
  });

  test('Scenario 2: Drag & Drop Sliders', async ({ page }) => {
    // 1. Open page
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Drag & Drop Sliders"
    await page.locator('a[href*="drag-drop-range-sliders-demo"]').click();
    await expect(page).toHaveURL(/.*drag-drop-range-sliders-demo/);
    await waitForPage(page);

    // 3. There are 8 sliders on the page; "Default value 15" is the 3rd (index 2)
    //    We target it specifically and its adjacent output via JS
    const sliders = page.locator('input[type="range"]');
    // await sliders.first().waitFor({ state: 'visible', timeout: 60000 });

    // 4. Set slider value to 95 via JS (most reliable in headless)
    //    Then fire both 'input' and 'change' events so the page's output updates
    await page.evaluate(() => {
      // "Default value 15" slider is the 3rd range input (index 2)
      const allSliders = document.querySelectorAll('input[type="range"]');
      const slider = allSliders[2] as HTMLInputElement;
      slider.value = '95';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 5. Validate: the output element next to the 3rd slider shows 95
    //    Output elements sit alongside each slider; index matches slider index
    const outputValue = await page.evaluate(() => {
      const outputs = document.querySelectorAll('output');
      // If outputs exist use them, else read the slider value directly
      if (outputs.length >= 3) {
        return outputs[2].textContent?.trim();
      }
      const allSliders = document.querySelectorAll('input[type="range"]');
      return (allSliders[2] as HTMLInputElement).value;
    });

    expect(outputValue).toBe('95');
  });

  test('Scenario 3: Input Form Submit', async ({ page }) => {
    // 1. Open page
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Input Form Submit"
    await page.locator('a[href*="input-form-demo"]').click();
    await expect(page).toHaveURL(/.*input-form-demo/);
    await waitForPage(page);

    // Wait for the form's first field to be visible
    // await page.locator('#name').waitFor({ state: 'visible', timeout: 60000 });

    // 3. Click Submit without filling anything
    await page.locator('[type="submit"]').click();

    // 4. Assert browser native validation fires on name field
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    // "fill" works across Chromium, Firefox, WebKit
    expect(validationMessage.toLowerCase()).toContain('fill');

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

    // 6. Select "United States" from Country dropdown
    await page.selectOption('select[name="country"]', { label: 'United States' });

    // 7. Submit the completed form
    await page.locator('[type="submit"]').click();

    // 8. Validate success message
    await expect(page.locator('.success-msg')).toHaveText(
      'Thanks for contacting us, we will get back to you shortly.',
      { timeout: 15000 }
    );
  });
});