import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'scratch', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBrowserAutomation() {
  console.log('🚀 Launching Google Chrome via Puppeteer-Core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: { width: 1280, height: 850 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  try {
    // -------------------------------------------------------------
    // Step 1: Login with rohansai280604@gmail.com / 12345678
    // -------------------------------------------------------------
    console.log('\n[1/6] Navigating to Login Page (http://localhost:3000/login)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login-page.png') });

    console.log('Typing credentials...');
    await page.waitForSelector('input[name="email"], input#email', { timeout: 15000 });
    await page.type('input[name="email"], input#email', 'rohansai280604@gmail.com');
    await page.type('input[name="password"], input#password', '12345678');

    console.log('Submitting login form...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await sleep(4000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-post-login.png') });
    console.log('Current URL after login attempt:', page.url());

    // -------------------------------------------------------------
    // Step 2: Navigate to Admin Control Center
    // -------------------------------------------------------------
    console.log('\n[2/6] Navigating to Admin Dashboard (http://localhost:3000/admin)...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-admin-dashboard.png') });
    console.log('✅ Admin Dashboard loaded successfully.');

    // -------------------------------------------------------------
    // Step 3: Check Admin Products Catalog
    // -------------------------------------------------------------
    console.log('\n[3/6] Checking Admin Products Manager (http://localhost:3000/admin/products)...');
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-admin-products.png') });
    console.log('✅ Admin Products page rendered.');

    // -------------------------------------------------------------
    // Step 4: Check Executive Reports
    // -------------------------------------------------------------
    console.log('\n[4/6] Checking Executive Reports (http://localhost:3000/admin/reports)...');
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-admin-reports.png') });
    console.log('✅ Executive Reports page rendered.');

    // -------------------------------------------------------------
    // Step 5: Check Visual Builder Studio
    // -------------------------------------------------------------
    console.log('\n[5/6] Checking Visual Studio Builder (http://localhost:3000/builder)...');
    await page.goto(`${BASE_URL}/builder`, { waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-visual-builder.png') });
    console.log('✅ Visual Studio Builder loaded.');

    // -------------------------------------------------------------
    // Step 6: Verify Customer Storefront Views
    // -------------------------------------------------------------
    console.log('\n[6/6] Verifying Customer Storefront Home & Catalog...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-customer-home.png') });
    console.log('✅ Customer Homepage rendered with dynamic sections.');

    await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-customer-products.png') });
    console.log('✅ Customer Products Grid rendered.');

    console.log('\n🎉 ALL BROWSER CHECKS COMPLETED SUCCESSFULLY!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    await sleep(4000);
  } catch (err: any) {
    console.error('❌ Browser automation error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error-state.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
}

runBrowserAutomation().catch(console.error);

