import { test, expect } from '@playwright/test';
 
test.describe('TestMu AI Selenium Playground Scenarios', () => {
  test('Test Scenario 1: should validate message input and display', async ({ page }) => {
    // Maximize the browser window
    await page.setViewportSize({ width: 1920, height: 1080 });
 
    // 1. Open LambdaTest's Selenium Playground
    await page.goto('https://www.testmuai.com/selenium-playground/');
 
   // 2. Click “Simple Form Demo”
  await page.getByText("Simple Form Demo").click();
  await expect(page).toHaveURL(/.*simple-form-demo/);
  await page.waitForLoadState('networkidle'); 

 
    // 4. Create a variable for a string value
    const messageText = "Welcome to TestMu AI";
 
    // 5. Use this variable to enter values in the "Enter Message" text box - using ID locator
    await page.getByRole('textbox', { name: 'Please enter your Message', exact: true }).fill(messageText);
 
    // 6. Click "Get Checked Value" - using CSS selector
    await page.locator('#showInput').click();
 
    // 7. Validate whether the same text message is displayed in the right-hand panel
    const displayedMessage = await page.locator('#message').textContent();
    expect(displayedMessage).toBe(messageText);
  });
 
  test('Test Scenario 2:should drag slider to value 95', async ({ page }) => {
    // Maximize the browser window
    await page.setViewportSize({ width: 1920, height: 1080 });
 
    // 1. Open the Selenium Playground page and click "Drag & Drop Sliders"
    await page.goto('https://www.testmuai.com/selenium-playground/',{ waitUntil: 'domcontentloaded' });
 
    // 2. Click “Drag & Drop Sliders”
  await page.getByText('Drag & Drop Sliders').click();
  await expect(page).toHaveURL(/.*drag-drop-range-sliders-demo/);
  await page.waitForLoadState('networkidle'); 

    // 2. Select the slider "Default value 15" and drag the bar to make it 95
    // Using XPath locator for the slider with default value 15
    const sliderHandle = page.locator('(//input[@type="range"])[3]');
    const rangeOutput = page.locator('(//output[@id="rangeSuccess"])[1]');
 
    // Get the slider element's bounding box
    const sliderBox = await sliderHandle.boundingBox();
 
    if (sliderBox) {
      // Calculate the position to drag to (95 out of 100)
      const targetPosition = sliderBox.x + (sliderBox.width * 0.93);
 
      // Drag the slider to the target position with steps for precision
      await sliderHandle.hover();
      await page.mouse.down();
      await page.mouse.move(targetPosition, sliderBox.y + sliderBox.height / 2, { steps: 10 });
      await page.mouse.up();
 
      // Wait for value to update
      await page.waitForTimeout(500);
    }
 
    // Validate whether the range value shows 95
    await expect(rangeOutput).toHaveText('95');
  });
  test('Test Scenario 3:should validate form submission with required fields', async ({ page }) => {
    // Maximize the browser window
    await page.setViewportSize({ width: 1920, height: 1080 });
    // 1. Open the Selenium Playground page and click "Input Form Submit"
     await page.goto('https://www.testmuai.com/selenium-playground/');
 
    await page.getByText('Input Form Submit').click();
    await page.waitForLoadState('networkidle'); 

    // 2. Click "Submit" without filling in any information in the form
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
 
    // 3. Assert "Please fill in the fields" error message
    // Check if the name field shows validation message
    const nameInput = page.locator('#name');
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy(); // Browser validation message appears
 
    // 4. Fill in Name, Email, and other fields
    // Using different locator types (ID, name, CSS selector)
    await nameInput.fill('John Doe');
    await page.locator('#inputEmail4').fill('john.doe@example.com');
    await page.locator('#inputPassword4').fill('SecurePass123');
    await page.locator('[name="company"]').fill('LambdaTest Inc');
    await page.locator('#websitename').fill('https://www.lambdatest.com');
 
    // 5. From the Country drop-down, select "United States" using the text property
    await page.locator('[name="country"]').selectOption({ label: 'United States' });
 
    // Fill remaining fields
    await page.locator('#inputCity').fill('San Francisco');
    await page.locator('[name="address_line1"]').fill('123 Main Street');
    await page.locator('[name="address_line2"]').fill('Suite 100');
    await page.getByLabel('City*', { exact: true }).fill('California');
    await page.locator('[name="zip"]').fill('94102');
 
    // 6. Fill in all fields and click "Submit"
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
 
    // 7. Once submitted, validate the success message
    const successMessage = page.locator('.success-msg');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Thanks for contacting us, we will get back to you shortly.');
  });
});