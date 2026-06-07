import { test, expect } from '@playwright/test';

// Use test.beforeEach so this happens for every single test in the file, on every browser
test.beforeEach(async ({ page }, testInfo) => {
  // Combine the scenario title and the browser name for a perfect dashboard label
  // Example: "Simple Form Demo - Chrome:Win10"
  const dashboardName = `${testInfo.title} - ${testInfo.project.name}`;
  // THIS IS THE FIX: Tell LambdaTest to rename the current active session
  await page.evaluate((name) => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestName', name: dashboardName })}`);
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
