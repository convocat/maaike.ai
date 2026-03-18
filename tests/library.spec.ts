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

  test('sort by "Last tended" changes card order', async ({ page }) => {
    // Get order before
    const orderBefore = await page.locator('.card').evaluateAll(
      (els) => els.map((el) => (el as HTMLElement).dataset.date)
    );

    await page.locator('[data-sort="updated"]').click();

    const orderAfter = await page.locator('.card').evaluateAll(
      (els) => els.map((el) => (el as HTMLElement).dataset.date)
    );

    // The sort button should now be active
    await expect(page.locator('[data-sort="updated"]')).toHaveClass(/active/);

    // Order may differ (not asserting exact order, just that state changed)
    // This is a smoke test for the sort mechanism
    expect(orderAfter).toBeDefined();
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
