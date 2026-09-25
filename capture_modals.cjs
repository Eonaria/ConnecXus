const puppeteer = require('puppeteer-core');
const path = require('path');

const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const outDir = 'd:/ConnecXus/admin/screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
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

  // 1. Login as arm
  console.log('Logging in as Arm...');
  await page.goto('http://localhost:3000/login', gotoOpts);
  await sleep(1500);
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('Arm');
    await inputs[1].type('12345678A');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('เข้าสู่ระบบ') || text.includes('Login') || text.includes('Sign in'))) {
        await btn.click();
        break;
      }
    }
  }
  await sleep(3500);

  // 05 & 18: Post Composer
  console.log('1. Capturing Post Composer Focus (05 & 18)...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2500);
    const composer = await page.$('.composer-textarea, textarea');
    if (composer) {
      await composer.click();
      await page.keyboard.type('แบ่งปันเรื่องราวและพูดคุยกับเพื่อนๆ ใน ConnecXus ✨');
      await sleep(1200);
      await page.screenshot({ path: path.join(outDir, '05_user_post_composer.png'), fullPage: false });
      await page.screenshot({ path: path.join(outDir, '18_modal_create_post.png'), fullPage: false });
    }
  } catch (e) { console.error('05/18 error:', e.message); }

  // 19: Edit Profile Modal
  console.log('2. Capturing Edit Profile Modal (19)...');
  try {
    await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
    await sleep(2500);
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('แก้ไขโปรไฟล์'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('19 Edit Profile clicked:', clicked);
    if (clicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '19_modal_edit_profile.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('19 error:', e.message); }

  // 20: Follow List Modal
  console.log('3. Capturing Follow List Modal (20)...');
  try {
    await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
    await sleep(2500);
    const clicked = await page.evaluate(() => {
      const bubble = document.querySelector('.stat-bubble.clickable');
      if (bubble) { bubble.click(); return true; }
      return false;
    });
    console.log('20 Follow List clicked:', clicked);
    if (clicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '20_modal_follow_list.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('20 error:', e.message); }

  // 22: Create Group Chat Modal
  console.log('4. Capturing Create Group Chat Modal (22)...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2500);
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('button[title="สร้างกลุ่มใหม่"], .header-actions-group button:last-child');
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('22 Create Group clicked:', clicked);
    if (clicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '22_modal_create_group_chat.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('22 error:', e.message); }

  // 24: Report Content Modal
  console.log('5. Capturing Report Content Modal (24)...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2500);
    const menuClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.btn-post-menu'));
      if (btns.length > 0) { btns[0].click(); return true; }
      return false;
    });
    console.log('24 3-dot menu clicked:', menuClicked);
    if (menuClicked) {
      await sleep(800);
      const reportClicked = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.post-dropdown-item'));
        const item = items.find(i => i.textContent.includes('รายงาน'));
        if (item) { item.click(); return true; }
        return false;
      });
      console.log('24 Report item clicked:', reportClicked);
      if (reportClicked) {
        await sleep(1800);
        await page.screenshot({ path: path.join(outDir, '24_modal_report_content.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await sleep(500);
      }
    }
  } catch (e) { console.error('24 error:', e.message); }

  // 23: Community Invite Modal (via Admin session)
  console.log('6. Capturing Community Invite Modal (23 as Admin)...');
  try {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Storage.clearDataForOrigin', { origin: 'http://localhost:3000', storageTypes: 'all' });

    await page.goto('http://localhost:3000/login', gotoOpts);
    await sleep(1500);
    const adminInputs = await page.$$('input');
    if (adminInputs.length >= 2) {
      await adminInputs[0].type('admin');
      await adminInputs[1].type('admin1234');
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('เข้าสู่ระบบ') || text.includes('Login') || text.includes('Sign in'))) {
          await btn.click();
          break;
        }
      }
    }
    await sleep(3500);

    await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
    await sleep(2500);
    const inviteClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const btn = btns.find(b => b.textContent.includes('เชิญ') || b.textContent.includes('Invite'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('23 Invite clicked:', inviteClicked);
    if (inviteClicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '23_modal_invite_member.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(500);
    }
  } catch (e) { console.error('23 error:', e.message); }

  await browser.close();
  console.log('All remaining modals captured successfully!');
}

run().catch(e => { console.error(e); process.exit(1); });
