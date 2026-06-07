import { test, expect } from '@playwright/test';

test.describe('TestMu AI Selenium Playground Scenarios', () => {
  const baseURL = 'https://www.testmuai.com/selenium-playground/';

  test('Scenario 1: Simple Form Demo', async ({ page }) => {
    // 1. Open TestMu AI Selenium Playground
    await page.goto(baseURL);

    // 2. Click “Simple Form Demo”
    await page.getByRole('link', { name: 'Simple Form Demo' }).click();

    // 3. Validate that the URL contains “simple-form-demo”
    // FIX: Corrected regex syntax (removed invalid backslash)
    await expect(page).toHaveURL(/.*simple-form-demo/);

    // 4. Create a variable for a string value
    const message = 'Welcome to TestMu AI';

    // 5. Use this variable to enter values in the “Enter Message” text box
    await page.getByPlaceholder('Please enter your Message').fill(message);

    // 6. Click “Get Checked Value”
    await page.getByRole('button', { name: 'Get Checked Value' }).click();

    // 7. Validate whether the same text message is displayed
    const messageLocator = page.locator('#message'); 
    await expect(messageLocator).toHaveText(message);
  });

  test('Scenario 2: Drag & Drop Sliders', async ({ page }) => {
    // 1. Open the page and click “Drag & Drop Sliders”
    await page.goto(baseURL);
    await page.getByText('Drag & Drop Sliders').click();
    await expect(page).toHaveURL(/.*drag-drop-range-sliders/);

    // 3. Locate the slider and the output field
    const sliderContainer = page.locator('.sp__range-success');
    const slider = sliderContainer.locator('input[type="range"]'); // FIX: Removed invalid backslashes
    const output = sliderContainer.locator('output#rangeSuccess');

    // Wait for the slider to be physically visible on screen before acting
    await expect(slider).toBeVisible({ timeout: 10000 });

    // 4. Get the slider's physical dimensions and drag it
    await slider.scrollIntoViewIfNeeded();
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      const centerY = sliderBox.y + sliderBox.height / 2;
      const currentX = sliderBox.x + (sliderBox.width * 0.15); // Start ~15%
      const targetX = sliderBox.x + (sliderBox.width * 0.95);  // Drag to ~95%

      await page.mouse.move(currentX, centerY);
      await page.mouse.down();
      await page.mouse.move(targetX, centerY, { steps: 10 });
      await page.mouse.up();
    }

    // 5. Keyboard Micro-Adjustment for exact 95 value
    // This is much more reliable across Windows/Linux cloud grids than mouse loops
    await slider.focus();
    for (let i = 0; i < 50; i++) {
      const currentVal = parseInt(await output.textContent() || '0', 10);
      if (currentVal === 95) break;
      if (currentVal > 95) {
        await page.keyboard.press('ArrowLeft');
      } else {
        await page.keyboard.press('ArrowRight');
      }
    }

    // 6. Validate the final value is 95
    await expect(output).toHaveText('95');
  });

  test('Scenario 3: Input Form Submit', async ({ page }) => {
    // 1. Open the page and click “Input Form Submit”
    await page.goto(baseURL);
    await page.getByText('Input Form Submit').click();
    await expect(page).toHaveURL(/.*input-form-demo/);

    const submitButton = page.getByRole('button', { name: 'Submit' });

    // 3. Click “Submit” without filling in any information
    await submitButton.click();

    // 4. Assert “Please fill in the fields” error message
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate((element: HTMLInputElement) => element.validationMessage);
    expect(validationMessage).toContain('fill');

    // FIX: Removed invalid backslashes from all attribute locators
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

    // 5. Select “United States” from the Country drop-down
    await page.selectOption('select[name="country"]', { label: 'United States' });

    // 6. Click “Submit” again now that the form is full
    await submitButton.click();

    // 7. Validate the success message
    const successMessage = page.locator('.success-msg');
    
    // Explicit wait for the network to return the success message after submitting
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toHaveText('Thanks for contacting us, we will get back to you shortly.');
  });

});
