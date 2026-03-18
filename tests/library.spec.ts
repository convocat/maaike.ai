import { test, expect } from '@playwright/test';

test.describe('Library page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test('renders book cards', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(10);
  });

  test('category filter hides non-matching books', async ({ page }) => {
    // Count all visible cards before filtering
    const allCards = page.locator('.card:visible');
    const totalBefore = await allCards.count();

    // Click a category button (Conversation design)
    const catBtn = page.locator('.category-btn').first();
    await catBtn.click();
    await expect(catBtn).toHaveAttribute('aria-pressed', 'true');

    // Fewer (or equal) cards should now be visible
    const visibleAfter = await page.locator('.card').evaluateAll(
      (els) => els.filter((el) => (el as HTMLElement).style.display !== 'none').length
    );
    expect(visibleAfter).toBeLessThanOrEqual(totalBefore);
  });

  test('clicking the same category again shows all books', async ({ page }) => {
    const allCards = page.locator('.card');
    const totalBefore = await allCards.count();

    const catBtn = page.locator('.category-btn').first();
    await catBtn.click(); // activate
    await catBtn.click(); // deactivate

    await expect(catBtn).toHaveAttribute('aria-pressed', 'false');

    const visibleAfter = await page.locator('.card').evaluateAll(
      (els) => els.filter((el) => (el as HTMLElement).style.display !== 'none').length
    );
    expect(visibleAfter).toBe(totalBefore);
  });

  test('maturity filter works', async ({ page }) => {
    const totalBefore = await page.locator('.card').count();

    // Click the 🌱 (draft) maturity button
    const draftBtn = page.locator('.maturity-btn[data-filter="draft"]');
    await draftBtn.click();
    await expect(draftBtn).toHaveAttribute('aria-pressed', 'true');

    const visibleAfter = await page.locator('.card').evaluateAll(
      (els) => els.filter((el) => (el as HTMLElement).style.display !== 'none').length
    );
    expect(visibleAfter).toBeLessThanOrEqual(totalBefore);

    // All visible cards should have maturity="draft"
    const maturities = await page.locator('.card').evaluateAll(
      (els) =>
        els
          .filter((el) => (el as HTMLElement).style.display !== 'none')
          .map((el) => (el as HTMLElement).dataset.maturity)
    );
    for (const m of maturities) {
      expect(m).toBe('draft');
    }
  });

  test('All button resets maturity filter', async ({ page }) => {
    const total = await page.locator('.card').count();

    await page.locator('.maturity-btn[data-filter="draft"]').click();
    await page.locator('[data-filter="all"]').click();

    const visibleAfter = await page.locator('.card').evaluateAll(
      (els) => els.filter((el) => (el as HTMLElement).style.display !== 'none').length
    );
    expect(visibleAfter).toBe(total);
  });

  test('status filter shows only to-be-read books', async ({ page }) => {
    const toReadBtn = page.locator('.status-btn[data-status="to-read"]');
    await toReadBtn.click();
    await expect(toReadBtn).toHaveAttribute('aria-pressed', 'true');

    const statuses = await page.locator('.card').evaluateAll(
      (els) =>
        els
          .filter((el) => (el as HTMLElement).style.display !== 'none')
          .map((el) => (el as HTMLElement).dataset.status)
    );
    for (const s of statuses) {
      expect(s).toBe('to-read');
    }
  });

  test('status filter shows only finished books', async ({ page }) => {
    const readBtn = page.locator('.status-btn[data-status="read"]');
    await readBtn.click();
    await expect(readBtn).toHaveAttribute('aria-pressed', 'true');

    const statuses = await page.locator('.card').evaluateAll(
      (els) =>
        els
          .filter((el) => (el as HTMLElement).style.display !== 'none')
          .map((el) => (el as HTMLElement).dataset.status)
    );
    for (const s of statuses) {
      expect(s).toBe('read');
    }
  });

  test('clicking active status button again shows all books', async ({ page }) => {
    const total = await page.locator('.card').count();
    const toReadBtn = page.locator('.status-btn[data-status="to-read"]');
    await toReadBtn.click();
    await toReadBtn.click();
    await expect(toReadBtn).toHaveAttribute('aria-pressed', 'false');

    const visibleAfter = await page.locator('.card').evaluateAll(
      (els) => els.filter((el) => (el as HTMLElement).style.display !== 'none').length
    );
    expect(visibleAfter).toBe(total);
  });
});

test.describe('Recommender drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test('drawer is hidden by default', async ({ page }) => {
    const drawer = page.locator('#recommenderDrawer');
    await expect(drawer).toBeAttached();
    await expect(drawer).not.toHaveClass(/open/);
  });

  test('open button shows the drawer', async ({ page }) => {
    await page.locator('#recommenderBtn').click();
    await expect(page.locator('#recommenderDrawer')).toHaveClass(/open/);
  });

  test('close button hides the drawer', async ({ page }) => {
    await page.locator('#recommenderBtn').click();
    await expect(page.locator('#recommenderDrawer')).toHaveClass(/open/);

    await page.locator('#drawerClose').click();
    await expect(page.locator('#recommenderDrawer')).not.toHaveClass(/open/);
  });
});
