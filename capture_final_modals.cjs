const puppeteer = require('puppeteer-core');
const path = require('path');

const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const outDir = 'd:/ConnecXus/admin/screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function loginUser(page, username, password) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await sleep(1500);

  // Switch to password tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.auth-tab-btn, button'));
    const pwTab = tabs.find(t => t.textContent.includes('รหัสผ่าน'));
    if (pwTab) pwTab.click();
  });
  await sleep(800);

  // Fill in inputs
  const inputs = await page.$$('input[type="text"], input[type="password"], input');
  if (inputs.length >= 2) {
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type(username);
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].type(password);
    
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-submit-glow, button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('เข้าสู่ระบบ'));
      if (btn) btn.click();
    });
  }
  await sleep(3500);
}

async function run() {
  console.log('Launching Brave for remaining modals...');
  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  const gotoOpts = { waitUntil: 'domcontentloaded', timeout: 30000 };

  // 1. Login as Arm
  console.log('Logging in as Arm...');
  await loginUser(page, 'Arm', '12345678A');
  console.log('Current URL after Arm login:', page.url());

  // 19: Edit Profile Modal
  console.log('Capturing 19: Edit Profile Modal...');
  try {
    await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
    await sleep(2500);
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('แก้ไขโปรไฟล์'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('19 clicked:', clicked);
    if (clicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '19_modal_edit_profile.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('19 error:', e.message); }

  // 22: Create Group Chat Modal
  console.log('Capturing 22: Create Group Chat Modal...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2500);
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.btn-icon-glass, button'));
      const btn = btns.find(b => (b.getAttribute('title') && b.getAttribute('title').includes('กลุ่ม')) || b.innerHTML.includes('M17 21v-2a4'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('22 clicked:', clicked);
    if (clicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '22_modal_create_group_chat.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('22 error:', e.message); }

  // 24: Report Content Modal
  console.log('Capturing 24: Report Content Modal...');
  try {
    await page.goto('http://localhost:3000/post/1', gotoOpts);
    await sleep(2500);
    const menuClicked = await page.evaluate(() => {
      const btn = document.querySelector('.btn-post-menu');
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('24 menu clicked:', menuClicked);
    if (menuClicked) {
      await sleep(800);
      const reportClicked = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.post-dropdown-item'));
        const item = items.find(i => i.textContent.includes('รายงาน'));
        if (item) { item.click(); return true; }
        return false;
      });
      console.log('24 report clicked:', reportClicked);
      if (reportClicked) {
        await sleep(1800);
        await page.screenshot({ path: path.join(outDir, '24_modal_report_content.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await sleep(500);
      }
    }
  } catch (e) { console.error('24 error:', e.message); }

  // 23: Community Invite Modal (Logged in as admin)
  console.log('Capturing 23: Community Invite Modal...');
  try {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Storage.clearDataForOrigin', { origin: 'http://localhost:3000', storageTypes: 'all' });

    await loginUser(page, 'admin', 'admin1234');
    console.log('Current URL after admin login:', page.url());

    await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
    await sleep(2500);

    // Click privacy tab to show invite generator
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.settings-tab-btn, button'));
      const privTab = tabs.find(t => t.textContent.includes('ความเป็นส่วนตัว') || t.textContent.includes('Privacy'));
      if (privTab) privTab.click();
    });
    await sleep(1800);
    await page.screenshot({ path: path.join(outDir, '23_modal_invite_member.png'), fullPage: false });
  } catch (e) { console.error('23 error:', e.message); }

  await browser.close();
  console.log('Final targeted modals captured successfully!');
}

run().catch(console.error);
