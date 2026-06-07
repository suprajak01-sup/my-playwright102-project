import { test, expect } from '@playwright/test';

test.describe('TestMu AI Selenium Playground Scenarios', () => {

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

 test('Drag and Drop Slider validation with fine-tuning', async ({ page }) => {
  // 1. Open the Selenium Playground
  await page.goto('https://www.lambdatest.com/selenium-playground/', { waitUntil: 'networkidle' });

  // 2. Click “Drag & Drop Sliders”
  await page.getByText('Drag & Drop Sliders').click();
  await expect(page).toHaveURL(/.*drag-drop-range-sliders-demo/);
  await page.waitForLoadState('networkidle'); 

  // 3. Locate the slider and the output field
  const sliderContainer = page.locator('.sp__range-success');
  const slider = sliderContainer.locator('input[type="range"]');
  const output = sliderContainer.locator('output#rangeSuccess');

  // 4. Get the slider's physical dimensions
  const sliderBox = await slider.boundingBox();
  if (sliderBox) {
    const centerY = sliderBox.y + sliderBox.height / 2;
    // Estimated starting point at 15%
    let currentX = sliderBox.x + (sliderBox.width * 0.15);
    // Estimated target point at 95%
    let targetX = sliderBox.x + (sliderBox.width * 0.95);

    // Initial Drag
    await page.mouse.move(currentX, centerY);
    await page.mouse.down();
    await page.mouse.move(targetX, centerY, { steps: 10 });

   //Loop to move
    // If it's not 95, move 1 pixel at a time until it is exactly 95
    for (let i = 0; i < 20; i++) { // Max 20 adjustments to avoid infinite loops
      const currentVal = parseInt(await output.textContent() || '0');
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

test('Input Form Submit validation', async ({ page }) => {
  // 1. Open the Selenium Playground
  await page.goto('https://www.lambdatest.com/selenium-playground/', { waitUntil: 'networkidle' });

  // 2. Click “Input Form Submit”
  await page.getByText('Input Form Submit').click();
  await expect(page).toHaveURL(/.*input-form-demo/);
  await page.waitForLoadState('networkidle'); 

  // Using getByRole 
  const submitButton = page.getByRole('button', { name: 'Submit' });
  
  // 3. Click “Submit” without filling in any information
  await submitButton.click();

  // 4. Assert “Please fill in the fields” error message
  const nameInput = page.locator('#name');
  const validationMessage = await nameInput.evaluate((element: HTMLInputElement) => element.validationMessage);
  
  // We check for "fill" to ensure it works across Chromium, Firefox, and WebKit.
  expect(validationMessage).toContain('fill');

  
  // Using locator() with IDs 
  await nameInput.fill('Kandikanti Supraja');
  await page.locator('#company').fill('Deloitte');
  await page.locator('#websitename').fill('https://www.deloitte.com');
  
 
  // Using getByPlaceholder
  await page.getByPlaceholder('Email').fill('supraja@example.com');
  await page.getByPlaceholder('Password').fill('Password123');
  await page.getByPlaceholder('City').fill('Hyderabad');
  await page.getByPlaceholder('Address 1').fill('Hi-Tech City');
  await page.getByPlaceholder('Address 2').fill('Phase 2');
  await page.getByPlaceholder('State').fill('Telangana');
  await page.getByPlaceholder('Zip code').fill('500081');

  // 5. Select “United States” from the Country drop-down using text property
  await page.selectOption('select[name="country"]', { label: 'United States' });

  // 6. Click “Submit” again now that the form is full
  await submitButton.click();

  // 7. Validate the success message
  const successMessage = page.locator('.success-msg');
  await expect(successMessage).toHaveText('Thanks for contacting us, we will get back to you shortly.');
});
});