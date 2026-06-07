import { test, expect } from '@playwright/test';

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
