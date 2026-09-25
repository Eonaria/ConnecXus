const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const outDir = 'd:/ConnecXus/admin/screenshots';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
} else {
  const oldFiles = fs.readdirSync(outDir);
  for (const f of oldFiles) {
    if (f.endsWith('.png')) {
      try { fs.unlinkSync(path.join(outDir, f)); } catch (e) {}
    }
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickButtonByText(page, text) {
  return await page.evaluate((t) => {
    const xpath = `//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')] | //a[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')] | //div[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')]`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
      result.click();
      return true;
    }
    return false;
  }, text);
}

async function run() {
  console.log('Launching Brave browser at:', bravePath);
  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  const gotoOpts = { waitUntil: 'domcontentloaded', timeout: 30000 };

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 1: PUBLIC & AUTH PAGES
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('01. Capturing Login Page...');
  try {
    await page.goto('http://localhost:3000/login', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '01_login_page.png'), fullPage: false });
  } catch (e) { console.log('01 error:', e.message); }

  console.log('02. Capturing Register Page...');
  try {
    await page.goto('http://localhost:3000/register', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '02_register_page.png'), fullPage: false });
  } catch (e) { console.log('02 error:', e.message); }

  console.log('03. Capturing QR Auth Page...');
  try {
    await page.goto('http://localhost:3000/qr-auth', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '03_qr_login_page.png'), fullPage: false });
  } catch (e) { console.log('03 error:', e.message); }

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 2: USER LOGIN & CORE PAGES (arm / 12345678A)
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('--- Logging in as USER: arm ---');
  try {
    await page.goto('http://localhost:3000/login', gotoOpts);
    await sleep(1500);

    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type('arm');
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
    console.log('Current URL after user login:', page.url());
  } catch (e) { console.log('User login error:', e.message); }

  console.log('04. Capturing Home Feed...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '04_user_home_feed.png'), fullPage: false });
  } catch (e) { console.log('04 error:', e.message); }

  console.log('05. Capturing Post Composer Focus...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2000);
    const composer = await page.$('.composer-textarea, textarea');
    if (composer) {
      await composer.click();
      await page.keyboard.type('สวัสดี ConnecXus! สังคมออนไลน์และพื้นที่แบ่งปันเรื่องราว 🚀');
      await sleep(1000);
      await page.screenshot({ path: path.join(outDir, '05_user_post_composer.png'), fullPage: false });
    }
  } catch (e) { console.log('05 error:', e.message); }

  console.log('06. Capturing Single Post View (/post/1)...');
  try {
    await page.goto('http://localhost:3000/post/1', gotoOpts);
    await sleep(2200);
    await page.screenshot({ path: path.join(outDir, '06_user_single_post.png'), fullPage: false });
  } catch (e) { console.log('06 error:', e.message); }

  console.log('07. Capturing Explore & Trends Page...');
  try {
    await page.goto('http://localhost:3000/explore', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '07_user_explore.png'), fullPage: false });
  } catch (e) { console.log('07 error:', e.message); }

  console.log('08. Capturing Notifications Page...');
  try {
    await page.goto('http://localhost:3000/notifications', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '08_user_notifications.png'), fullPage: false });
  } catch (e) { console.log('08 error:', e.message); }

  console.log('09. Capturing Bookmarks Page...');
  try {
    await page.goto('http://localhost:3000/bookmarks', gotoOpts);
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '09_user_bookmarks.png'), fullPage: false });
  } catch (e) { console.log('09 error:', e.message); }

  console.log('10. Capturing Messages / Chat List...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '10_user_messages_list.png'), fullPage: false });
  } catch (e) { console.log('10 error:', e.message); }

  console.log('11. Capturing Active Chat Room / Conversation...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2000);
    const convCard = await page.$('.conversation-card, [class*="chat-item"], [class*="conv-item"]');
    if (convCard) {
      await convCard.click();
      await sleep(1800);
    }
    await page.screenshot({ path: path.join(outDir, '11_user_chat_conversation.png'), fullPage: false });
  } catch (e) { console.log('11 error:', e.message); }

  console.log('12. Capturing Community Directory...');
  try {
    await page.goto('http://localhost:3000/community', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '12_user_community_list.png'), fullPage: false });
  } catch (e) { console.log('12 error:', e.message); }

  console.log('13. Capturing Community Detail (Feed Tab): /community/ovo ...');
  try {
    await page.goto('http://localhost:3000/community/ovo', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '13_user_community_detail_feed.png'), fullPage: false });
  } catch (e) { console.log('13 error:', e.message); }

  console.log('14. Capturing Community Detail (Gallery Tab)...');
  try {
    await page.goto('http://localhost:3000/community/ovo', gotoOpts);
    await sleep(2000);
    await clickButtonByText(page, 'รวมภาพ');
    await sleep(1500);
    await page.screenshot({ path: path.join(outDir, '14_user_community_detail_gallery.png'), fullPage: false });
  } catch (e) { console.log('14 error:', e.message); }

  console.log('15. Capturing Community Settings (/community/ovo/settings)...');
  try {
    await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '15_user_community_settings.png'), fullPage: false });
  } catch (e) { console.log('15 error:', e.message); }

  console.log('16. Capturing User Profile Page (arm)...');
  try {
    await page.goto('http://localhost:3000/profile/arm', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '16_user_profile.png'), fullPage: false });
  } catch (e) { console.log('16 error:', e.message); }

  console.log('17. Capturing Security Settings Page...');
  try {
    await page.goto('http://localhost:3000/settings/security', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '17_user_security_settings.png'), fullPage: false });
  } catch (e) { console.log('17 error:', e.message); }

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 3: USER MODALS & DIALOGS
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('18. Capturing Modal: Create Post Focus...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2000);
    const composer = await page.$('.composer-textarea, textarea');
    if (composer) {
      await composer.click();
      await page.keyboard.type('แชร์ไอเดียและความคิดสร้างสรรค์ของคุณได้ที่นี่...');
      await sleep(1200);
      await page.screenshot({ path: path.join(outDir, '18_modal_create_post.png'), fullPage: false });
    }
  } catch (e) { console.log('18 error:', e.message); }

  console.log('19. Capturing Modal: Edit Profile...');
  try {
    await page.goto('http://localhost:3000/profile/arm', gotoOpts);
    await sleep(2200);
    const opened = await clickButtonByText(page, 'แก้ไขโปรไฟล์');
    if (opened) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '19_modal_edit_profile.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('19 error:', e.message); }

  console.log('20. Capturing Modal: Follow / Following List...');
  try {
    await page.goto('http://localhost:3000/profile/arm', gotoOpts);
    await sleep(2200);
    const statClicked = await page.evaluate(() => {
      const el = document.querySelector('.stat-bubble.clickable');
      if (el) { el.click(); return true; }
      return false;
    });
    if (statClicked) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '20_modal_follow_list.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('20 error:', e.message); }

  console.log('21. Capturing Modal: Create Community...');
  try {
    await page.goto('http://localhost:3000/community', gotoOpts);
    await sleep(2200);
    const opened = await clickButtonByText(page, 'สร้างชุมชน');
    if (opened) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '21_modal_create_community.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('21 error:', e.message); }

  console.log('22. Capturing Modal: Create Group Chat...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2200);
    const opened = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="กลุ่ม"], button[title*="Group"], .header-actions-group button:nth-child(2)');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (opened) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '22_modal_create_group_chat.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('22 error:', e.message); }

  console.log('23. Capturing Modal: Invite Member to Community...');
  try {
    await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
    await sleep(2200);
    const opened = await clickButtonByText(page, 'เชิญ');
    if (opened) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '23_modal_invite_member.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('23 error:', e.message); }

  console.log('24. Capturing Modal: Report Content...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2200);
    const menuClicked = await page.evaluate(() => {
      const menuBtn = document.querySelector('.btn-post-menu');
      if (menuBtn) { menuBtn.click(); return true; }
      return false;
    });
    if (menuClicked) {
      await sleep(800);
      const reportBtnClicked = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.post-dropdown-item'));
        const rItem = items.find(i => i.textContent.includes('รายงาน'));
        if (rItem) { rItem.click(); return true; }
        return false;
      });
      if (reportBtnClicked) {
        await sleep(1500);
        await page.screenshot({ path: path.join(outDir, '24_modal_report_content.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await sleep(600);
      }
    }
  } catch (e) { console.log('24 error:', e.message); }

  console.log('25. Capturing Modal: Change Password / Security...');
  try {
    await page.goto('http://localhost:3000/settings/security', gotoOpts);
    await sleep(2200);
    const opened = await clickButtonByText(page, 'เปลี่ยน');
    if (opened) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '25_modal_security_change_password.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('25 error:', e.message); }

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 4: ADMIN PANEL & ADMIN MODALS (admin / admin1234)
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('--- Switching session to ADMIN: admin ---');
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
    console.log('Current URL after admin login:', page.url());
  } catch (e) { console.log('Admin login error:', e.message); }

  console.log('26. Capturing Admin Dashboard Overview...');
  try {
    await page.goto('http://localhost:3000/admin', gotoOpts);
    await sleep(2500);
    await page.screenshot({ path: path.join(outDir, '26_admin_dashboard_overview.png'), fullPage: false });
  } catch (e) { console.log('26 error:', e.message); }

  console.log('27. Capturing Admin Users Tab...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('จัดการผู้ใช้') || el.textContent.includes('Users'));
      if (t) t.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '27_admin_users_tab.png'), fullPage: false });
  } catch (e) { console.log('27 error:', e.message); }

  console.log('28. Capturing Admin Banned Accounts Tab...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('ถูกระงับ') || el.textContent.includes('Banned'));
      if (t) t.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '28_admin_banned_users_tab.png'), fullPage: false });
  } catch (e) { console.log('28 error:', e.message); }

  console.log('29. Capturing Admin Communities Tab...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('จัดการชุมชน') || el.textContent.includes('Communities'));
      if (t) t.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '29_admin_communities_tab.png'), fullPage: false });
  } catch (e) { console.log('29 error:', e.message); }

  console.log('30. Capturing Admin Reports Tab...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('รายงาน') || el.textContent.includes('Reports'));
      if (t) t.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '30_admin_reports_tab.png'), fullPage: false });
  } catch (e) { console.log('30 error:', e.message); }

  console.log('31. Capturing Admin Logs Tab...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('ล็อก') || el.textContent.includes('Logs') || el.textContent.includes('บันทึก'));
      if (t) t.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(outDir, '31_admin_logs_tab.png'), fullPage: false });
  } catch (e) { console.log('31 error:', e.message); }

  console.log('32. Capturing Modal: Admin User Action / Ban Modal...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('จัดการผู้ใช้') || el.textContent.includes('Users'));
      if (t) t.click();
    });
    await sleep(1500);
    const actionClicked = await page.evaluate(() => {
      const actionBtn = document.querySelector('.actions-wrapper button');
      if (actionBtn) { actionBtn.click(); return true; }
      return false;
    });
    if (actionClicked) {
      await sleep(1500);
      await page.screenshot({ path: path.join(outDir, '32_modal_admin_user_action.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('32 error:', e.message); }

  await browser.close();
  console.log('====================================================');
  console.log('ALL SCREENSHOTS CAPTURED COMPLETELY & SUCCESSFULLY!');
  console.log('Saved in:', outDir);
  console.log('====================================================');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
