import { test, expect } from '@playwright/test';

test.describe('TestMu AI Selenium Playground Scenarios', () => {
  const baseURL = 'https://www.testmuai.com/selenium-playground/';

  // Helper: reliable page load that works both headed (local) and headless (HyperExecute)
  async function waitForPage(page: any) {
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    // 'networkidle' times out in headless CI; use a short best-effort wait instead
    await page.waitForLoadState('load', { timeout: 60000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // networkidle not guaranteed in headless — safe to continue
    }
  }

  test('Scenario 1: Simple Form Demo', async ({ page }) => {
    // 1. Open TestMu AI Selenium Playground
    await page.goto(baseURL);
    await waitForPage(page);

    // 2. Click "Simple Form Demo"
    await page.getByRole('link', { name: 'Simple Form Demo' }).click();

    // 3. Validate that the URL contains "simple-form-demo"
    await expect(page).toHaveURL(/.*simple-form-demo/);
    await waitForPage(page);

    // 4. Create a variable for a string value
    const message = 'Welcome to TestMu AI';

    // 5. Use this variable to enter values in the "Enter Message" text box
    await page.getByPlaceholder('Please enter your Message').fill(message);

    // 6. Click "Get Checked Value"
    await page.getByRole('button', { name: 'Get Checked Value' }).click();

    // 7. Validate whether the same text message is displayed
    const messageLocator = page.locator('#message');
    await expect(messageLocator).toHaveText(message);
  });

  test('Scenario 2: Drag & Drop Sliders', async ({ page }) => {
    // 1. Open the page
    await page.goto(baseURL);
    await waitForPage(page);

    // 2. Click "Drag & Drop Sliders"
    await page.getByText('Drag & Drop Sliders').click();
    await expect(page).toHaveURL(/.*drag-drop-range-sliders-demo/);
    await waitForPage(page);

    // 3. Locate the slider and the output field
    const sliderContainer = page.locator('.sp__range-success');
    const slider = sliderContainer.locator('input[type="range"]');
    const output = sliderContainer.locator('output#rangeSuccess');

    // 4. Wait for slider to be visible before getting bounding box
    await slider.waitFor({ state: 'visible', timeout: 30000 });

    // 5. Get the slider's physical dimensions
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      const centerY = sliderBox.y + sliderBox.height / 2;
      // Estimated starting point at 15%
      let currentX = sliderBox.x + sliderBox.width * 0.15;
      // Estimated target point at 95%
      let targetX = sliderBox.x + sliderBox.width * 0.95;

      // Initial drag
      await page.mouse.move(currentX, centerY);
      await page.mouse.down();
      await page.mouse.move(targetX, centerY, { steps: 10 });

      // Loop to fine-tune to exactly 95
      for (let i = 0; i < 20; i++) {
        const currentVal = parseInt((await output.textContent()) || '0');
        if (currentVal === 95) break;

        if (currentVal > 95) {
          targetX -= 1; // Move left if too high
        } else {
          targetX += 1; // Move right if too low
        }
        await page.mouse.move(targetX, centerY);
      }
      await page.mouse.up();
    }

    // 6. Validate the final value is 95
    await expect(output).toHaveText('95');
  });

  test('Scenario 3: Input Form Submit', async ({ page }) => {
    // 1. Open the page
    await page.goto(baseURL);
    await waitForPage(page);

    // 2. Click "Input Form Submit"
    await page.getByText('Input Form Submit').click();
    await expect(page).toHaveURL(/.*input-form-demo/);
    await waitForPage(page);

    const submitButton = page.getByRole('button', { name: 'Submit' });

    // 3. Click "Submit" without filling in any information
    await submitButton.click();

    // 4. Assert browser validation fires on the name field
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate(
      (element: HTMLInputElement) => element.validationMessage
    );
    // "fill" works across Chromium, Firefox, and WebKit
    expect(validationMessage).toContain('fill');

    // 5. Fill in all form fields
    await nameInput.fill('John Doe');
    await page.locator('input[id="inputEmail4"]').fill('john.doe@example.com');
    await page.locator('input[id="inputPassword4"]').fill('SecurePassword123');
    await page.locator('input[id="company"]').fill('Deloitte');
    await page.locator('input[id="websitename"]').fill('https://www.deloitte.com');
    await page.locator('input[id="inputCity"]').fill('San Francisco');
    await page.locator('input[id="inputAddress1"]').fill('123 Testing St');
    await page.locator('input[id="inputAddress2"]').fill('Suite 500');
    await page.locator('input[id="inputState"]').fill('California');
    await page.locator('input[id="inputZip"]').fill('94103');

    // 6. Select "United States" from the Country drop-down
    await page.selectOption('select[name="country"]', { label: 'United States' });

    // 7. Click "Submit" again now that the form is complete
    await submitButton.click();

    // 8. Validate the success message
    const successMessage = page.locator('.success-msg');
    await expect(successMessage).toHaveText(
      'Thanks for contacting us, we will get back to you shortly.'
    );
  });
});