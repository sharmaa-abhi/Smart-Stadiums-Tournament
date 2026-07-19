import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log('🚀 Starting Automated Role and Profile verification...');
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: path.join('C:/Users/ABHI SHARMA/.gemini/antigravity-ide/brain/40c04d7e-c714-4eba-8456-c81532d4860e', 'puppeteer_profile'),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const roles = ['operator', 'security', 'manager', 'admin'];
  const timestamp = Date.now();
  const results = [];

  const screenshotDir = 'C:/Users/ABHI SHARMA/.gemini/antigravity-ide/brain/cf5ca472-3650-4b35-b786-4b45f5c262da';

  for (const role of roles) {
    console.log(`\n=== Testing Role Profile: ${role.toUpperCase()} ===`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    global.pageRef = page;
    // Go to register
    await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
    await delay(500);

    const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    const email = `func_${role}_${timestamp}@stadium.com`;
    const password = 'password123';

    console.log(`Registering ${name} (${email})...`);

    // Fill registration form
    await page.waitForSelector('input[placeholder="John Doe"]');
    await page.type('input[placeholder="John Doe"]', name);
    await page.waitForSelector('input[placeholder="operator@stadiumgenius.io"]');
    await page.type('input[placeholder="operator@stadiumgenius.io"]', email);
    await page.waitForSelector('input[placeholder="Min 6 characters"]');
    await page.type('input[placeholder="Min 6 characters"]', password);

    // Click the role button matching the role
    const clicked = await page.evaluate((roleName) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.toLowerCase().includes(roleName === 'admin' ? 'admin' : roleName));
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, role);

    if (!clicked) {
      throw new Error(`Could not find role selector button for: ${role}`);
    }

    // Wait a brief moment to make sure select state resolves
    await delay(300);

    // Click Submit
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    // Wait for dashboard load
    await page.waitForSelector('.topbar-profile-name', { timeout: 20000 });
    await delay(2000); // Allow dashboard fetches and live counters to populate

    // Extract TopBar elements
    const topBarName = await page.$eval('.topbar-profile-name', el => el.textContent);
    const topBarRole = await page.$eval('.topbar-profile-role', el => el.textContent);

    // Get the avatar classes
    const avatarClasses = await page.evaluate(() => {
      const nameEl = document.querySelector('.topbar-profile-name');
      const parent = nameEl.parentElement;
      const avatar = parent.nextElementSibling;
      return avatar ? avatar.className : '';
    });

    // Get Welcome Banner info
    const bannerTitle = await page.$eval('h2.text-lg.font-bold', el => el.textContent);
    const bannerSubtitle = await page.$eval('p.text-sm.text-white\\/50', el => el.textContent);

    console.log(`✅ TopBar Name  : ${topBarName}`);
    console.log(`✅ TopBar Role  : ${topBarRole}`);
    console.log(`✅ Avatar style : ${avatarClasses}`);
    console.log(`✅ Dashboard Banner Title: "${bannerTitle}"`);
    console.log(`✅ Dashboard Banner Sub  : "${bannerSubtitle}"`);

    // Take screenshot
    const screenshotPath = path.join(screenshotDir, `${role}_dashboard.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    results.push({
      role,
      name: topBarName,
      topBarRole,
      avatarClasses,
      bannerTitle,
      bannerSubtitle,
      screenshotName: `${role}_dashboard.png`
    });

    await page.close();
    await delay(3000);
  }

  await browser.close();

  // Write results json
  fs.writeFileSync(path.join(screenshotDir, 'role_verification_results.json'), JSON.stringify(results, null, 2));
  console.log('\n🎉 All verification tests completed successfully. Summary results written.');
}

run().catch(async err => {
  console.error('❌ Verification script encountered an error:', err);
  if (global.pageRef) {
    try {
      const failPath = 'C:/Users/ABHI SHARMA/.gemini/antigravity-ide/brain/40c04d7e-c714-4eba-8456-c81532d4860e/failure.png';
      await global.pageRef.screenshot({ path: failPath });
      console.log(`📸 Saved failure state screenshot to: ${failPath}`);
    } catch (e) {
      console.error('Failed to take failure screenshot:', e);
    }
  }
  process.exit(1);
});
