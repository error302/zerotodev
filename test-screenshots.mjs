import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Login page
  console.log('1. Taking screenshot of login page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/z/my-project/download/01_login_page.png', fullPage: true });

  // 2. Login - use the submit button specifically
  console.log('2. Logging in...');
  await page.locator('input[placeholder*="example"]').fill('moe@zerotodev.dev');
  await page.locator('input[type="password"]').fill('password123');
  // Click the actual Sign In submit button (not the tab)
  await page.locator('button[type="submit"], button:has-text("Sign In"):not([role="tab"])').click();
  await page.waitForTimeout(5000);

  // 3. Dashboard
  console.log('3. Taking screenshot of dashboard...');
  await page.screenshot({ path: '/home/z/my-project/download/02_dashboard.png', fullPage: true });

  // 4. Lessons page
  console.log('4. Navigating to lessons...');
  // Click the nav item for Lessons (not heading or card)
  await page.locator('nav button, nav a').locator('text=Lessons').first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/home/z/my-project/download/03_lessons.png', fullPage: true });

  // 5. Lesson detail
  console.log('5. Opening first lesson...');
  await page.locator('text=Hello, Python').first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/home/z/my-project/download/04_lesson_detail.png', fullPage: true });

  // 6. Hacking Labs
  console.log('6. Navigating to hacking labs...');
  await page.locator('nav button, nav a').locator('text=Hacking Labs').first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/home/z/my-project/download/05_hacking_labs.png', fullPage: true });

  // 7. Leaderboard
  console.log('7. Navigating to leaderboard...');
  await page.locator('nav button, nav a').locator('text=Leaderboard').first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/home/z/my-project/download/06_leaderboard.png', fullPage: true });

  await browser.close();
  console.log('All screenshots taken successfully!');
})();
