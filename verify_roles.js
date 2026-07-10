import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log('🚀 Starting Automated Role and Profile verification...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const roles = ['operator', 'security', 'manager', 'admin'];
  const timestamp = Date.now();
  const results = [];

  const screenshotDir = 'C:/Users/ABHI SHARMA/.gemini/antigravity-ide/brain/97de6741-682c-4e97-b6e4-01ca6225f4cd';

  for (const role of roles) {
    console.log(`\n=== Testing Role Profile: ${role.toUpperCase()} ===`);
    
    // Go to register
    await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
    await delay(500);

    const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    const email = `func_${role}_${timestamp}@stadium.com`;
    const password = 'password123';

    console.log(`Registering ${name} (${email})...`);

    // Fill registration form
    await page.type('input[placeholder="John Doe"]', name);
    await page.type('input[placeholder="operator@stadiumgenius.io"]', email);
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

    // Wait for navigation/dashboard load
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await delay(2000); // Allow dashboard fetches and live counters to populate

    // Extract TopBar elements
    const topBarName = await page.$eval('.hidden.sm\\:block.text-right p:first-of-type', el => el.textContent);
    const topBarRole = await page.$eval('.hidden.sm\\:block.text-right p:last-of-type', el => el.textContent);
    
    // Get the avatar classes
    const avatarClasses = await page.evaluate(() => {
      const parent = document.querySelector('.hidden.sm\\:block.text-right');
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

    // Click Logout
    const logoutBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Logout'));
    });

    if (logoutBtn && logoutBtn.asElement()) {
      await logoutBtn.asElement().click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      console.log('🚪 Logged out successfully.');
    } else {
      console.warn('⚠️ Logout button not found, clearing localStorage.');
      await page.evaluate(() => localStorage.removeItem('sg_token'));
    }
    
    await delay(500);
  }

  await browser.close();

  // Write results json
  fs.writeFileSync(path.join(screenshotDir, 'role_verification_results.json'), JSON.stringify(results, null, 2));
  console.log('\n🎉 All verification tests completed successfully. Summary results written.');
}

run().catch(err => {
  console.error('❌ Verification script encountered an error:', err);
  process.exit(1);
});
