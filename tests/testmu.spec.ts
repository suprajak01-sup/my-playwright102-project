import { test, expect, Page } from '@playwright/test';

const PROJECT_NAME = process.env.PROJECT_NAME ?? 'Playwright-TestMu-Demo';
const NODE_ENV     = process.env.NODE_ENV     ?? 'testing';
const BASE_URL     = 'https://www.testmuai.com/selenium-playground/';

// ─── Page load helper ─────────────────────────────────────────────────────────
async function waitForPage(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 });
  await page.waitForLoadState('load',             { timeout: 60_000 });
  try {
    await page.waitForLoadState('networkidle', { timeout: 10_000 });
  } catch { /* safe to ignore in headless CI */ }
}

// ─── Navigation helper ────────────────────────────────────────────────────────
// Clicks a link AND waits for navigation to complete before returning.
// Required in headless CI where click + immediate URL check can race.
async function clickAndNavigate(page: Page, href: string): Promise<void> {
  await Promise.all([
    page.waitForURL(`**${href}**`, { timeout: 30_000 }),
    page.locator(`a[href*="${href}"]`).click(),
  ]);
  await waitForPage(page);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
test.describe(`TestMu AI Selenium Playground [${PROJECT_NAME} | ${NODE_ENV}]`, () => {

  // ── Scenario 1: Simple Form Demo ──────────────────────────────────────────
  test('Scenario 1: Simple Form Demo', async ({ page }) => {
    // 1. Open Selenium Playground
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Simple Form Demo" and wait for navigation
    await clickAndNavigate(page, 'simple-form-demo');

    // 3. Validate URL contains "simple-form-demo"
    await expect(page).toHaveURL(/simple-form-demo/);

    // 4. String variable
    const message = 'Welcome to TestMu AI';

    // 5. Fill "Enter Message" text box
    const messageInput = page.locator("input[placeholder='Please enter your Message']");
    await messageInput.waitFor({ state: 'visible', timeout: 30_000 });
    await messageInput.fill(message);

    // 6. Click "Get Checked Value"
    await page.locator("button:has-text('Get Checked Value')").click();

    // 7. Validate message shown under "Your Message:"
    await expect(page.locator('#message')).toHaveText(message, { timeout: 15_000 });
  });

  // ── Scenario 2: Drag & Drop Sliders ───────────────────────────────────────
  test('Scenario 2: Drag and Drop Slider validation with fine-tuning', async ({ page }) => {
    // 1. Open Selenium Playground
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Drag & Drop Sliders" and wait for navigation
    await clickAndNavigate(page, 'drag-drop-range-sliders-demo');

    // 3. Validate URL
    await expect(page).toHaveURL(/drag-drop-range-sliders-demo/);

    // 4. Target "Default value 15" slider — confirmed attribute selector
    const slider = page.locator('input[value="15"]');
    await slider.waitFor({ state: 'visible', timeout: 30_000 });

    // 5. Click slider to focus it
    await slider.click();

    // 6. Read the adjacent output element
    const output = page.locator('input[value="15"] + output');

    // 7. Press ArrowRight in a loop until output shows 95
    //    Loop-based keyboard is the only reliable headless drag approach
    for (let i = 0; i < 200; i++) {
      const current = (await output.innerText()).trim();
      if (current === '95') break;
      await page.keyboard.press('ArrowRight');
    }

    // 8. Validate range value shows 95
    await expect(output).toHaveText('95', { timeout: 10_000 });
  });

  // ── Scenario 3: Input Form Submit ─────────────────────────────────────────
  test('Scenario 3: Input Form Submit validation', async ({ page }) => {
    // 1. Open Selenium Playground
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPage(page);

    // 2. Click "Input Form Submit" and wait for navigation
    await clickAndNavigate(page, 'input-form-demo');

    // 3. Validate URL
    await expect(page).toHaveURL(/input-form-demo/);

    // Wait for form to be ready
    const nameInput = page.locator('#name');
    await nameInput.waitFor({ state: 'visible', timeout: 30_000 });

    // 4. Click Submit with empty form
    await page.locator("button:has-text('Submit')").click();

    // 5. Assert browser native validation — "Please fill in this field."
    const validationMsg = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMsg).toContain('fill');

    // 6. Fill all fields
    await nameInput.fill('John Doe');
    await page.locator('#inputEmail4').fill('john.doe@example.com');
    await page.locator('#inputPassword4').fill(process.env.API_PASSWORD ?? 'SecurePassword123');
    await page.locator('#company').fill('Deloitte');
    await page.locator('#websitename').fill('https://www.deloitte.com');
    await page.locator('#inputCity').fill('San Francisco');
    await page.locator('#inputAddress1').fill('123 Testing St');
    await page.locator('#inputAddress2').fill('Suite 500');
    await page.locator('#inputState').fill('California');
    await page.locator('#inputZip').fill('94103');

    // 7. Select "United States" from Country drop-down using text property
    await page.selectOption('select[name="country"]', { label: 'United States' });

    // 8. Submit completed form
    await page.locator("button:has-text('Submit')").click();

    // 9. Validate success message
    await expect(page.locator('p.success-msg')).toHaveText(
      'Thanks for contacting us, we will get back to you shortly.',
      { timeout: 15_000 }
    );
  });
});
