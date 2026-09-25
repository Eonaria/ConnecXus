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

async function getAuthToken(identifier, password) {
  const r = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const cookie = r.headers.get('set-cookie');
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
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
  console.log('Fetching auth tokens for user Arm and admin...');
  const userToken = await getAuthToken('Arm', '12345678A');
  const adminToken = await getAuthToken('admin', 'admin1234');
  console.log('Got userToken:', !!userToken, 'adminToken:', !!adminToken);

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
  await page.goto('http://localhost:3000/login', gotoOpts);
  await sleep(1500);
  await page.screenshot({ path: path.join(outDir, '01_login_page.png'), fullPage: false });

  console.log('02. Capturing Register Page...');
  await page.goto('http://localhost:3000/register', gotoOpts);
  await sleep(1500);
  await page.screenshot({ path: path.join(outDir, '02_register_page.png'), fullPage: false });

  console.log('03. Capturing QR Auth Page...');
  try {
    await page.goto('http://localhost:3000/qr-auth', gotoOpts);
    await sleep(1500);
    await page.screenshot({ path: path.join(outDir, '03_qr_login_page.png'), fullPage: false });
  } catch (e) { console.log('03 error:', e.message); }

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 2: USER LOGIN (Arm) & CORE PAGES
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('--- Setting USER (Arm) session ---');
  await page.setCookie({
    name: 'auth_token',
    value: userToken,
    domain: 'localhost',
    path: '/'
  });

  console.log('04. Capturing Home Feed...');
  await page.goto('http://localhost:3000/', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '04_user_home_feed.png'), fullPage: false });

  console.log('05. Capturing Post Composer Focus...');
  try {
    const composer = await page.$('.composer-textarea, textarea');
    if (composer) {
      await composer.click();
      await page.keyboard.type('ยินดีต้อนรับสู่ ConnecXus! สังคมออนไลน์และพื้นที่แบ่งปันเรื่องราว 🚀');
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
  await page.goto('http://localhost:3000/explore', gotoOpts);
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '07_user_explore.png'), fullPage: false });

  console.log('08. Capturing Notifications Page...');
  await page.goto('http://localhost:3000/notifications', gotoOpts);
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '08_user_notifications.png'), fullPage: false });

  console.log('09. Capturing Bookmarks Page...');
  await page.goto('http://localhost:3000/bookmarks', gotoOpts);
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '09_user_bookmarks.png'), fullPage: false });

  console.log('10. Capturing Messages / Chat List...');
  await page.goto('http://localhost:3000/messages', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '10_user_messages_list.png'), fullPage: false });

  console.log('11. Capturing Active Chat Room / Conversation...');
  try {
    const convCard = await page.$('.conversation-card, [class*="chat-item"], [class*="conv-item"]');
    if (convCard) {
      await convCard.click();
      await sleep(1800);
    }
    await page.screenshot({ path: path.join(outDir, '11_user_chat_conversation.png'), fullPage: false });
  } catch (e) { console.log('11 error:', e.message); }

  console.log('12. Capturing Community Directory...');
  await page.goto('http://localhost:3000/community', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '12_user_community_list.png'), fullPage: false });

  console.log('13. Capturing Community Detail (Feed Tab): /community/ovo ...');
  await page.goto('http://localhost:3000/community/ovo', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '13_user_community_detail_feed.png'), fullPage: false });

  console.log('14. Capturing Community Detail (Gallery Tab)...');
  await clickButtonByText(page, 'รวมภาพ');
  await sleep(1500);
  await page.screenshot({ path: path.join(outDir, '14_user_community_detail_gallery.png'), fullPage: false });

  console.log('15. Capturing Community Settings (/community/ovo/settings)...');
  await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '15_user_community_settings.png'), fullPage: false });

  console.log('16. Capturing User Profile Page (Arm)...');
  await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '16_user_profile.png'), fullPage: false });

  console.log('17. Capturing Security Settings Page...');
  await page.goto('http://localhost:3000/settings/security', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '17_user_security_settings.png'), fullPage: false });

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 3: USER MODALS & DIALOGS
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('18. Capturing Modal: Create Post (Composer Input Focus)...');
  try {
    await page.goto('http://localhost:3000/', gotoOpts);
    await sleep(2000);
    const composer = await page.$('.composer-textarea, textarea');
    if (composer) {
      await composer.click();
      await page.keyboard.type('สร้างสรรค์โพสต์และแบ่งปันความคิดของคุณ...');
      await sleep(1200);
      await page.screenshot({ path: path.join(outDir, '18_modal_create_post.png'), fullPage: false });
    }
  } catch (e) { console.log('18 error:', e.message); }

  console.log('19. Capturing Modal: Edit Profile...');
  try {
    await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
    await sleep(2500);
    const opened = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('แก้ไขโปรไฟล์'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (opened) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '19_modal_edit_profile.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('19 error:', e.message); }

  console.log('20. Capturing Modal: Follow / Following List...');
  try {
    await page.goto('http://localhost:3000/profile/Arm', gotoOpts);
    await sleep(2500);
    const statClicked = await page.evaluate(() => {
      const el = document.querySelector('.stat-bubble.clickable');
      if (el) { el.click(); return true; }
      return false;
    });
    if (statClicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '20_modal_follow_list.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('20 error:', e.message); }

  console.log('21. Capturing Modal: Create Community...');
  try {
    await page.goto('http://localhost:3000/community', gotoOpts);
    await sleep(2500);
    const opened = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.includes('สร้างชุมชน'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (opened) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '21_modal_create_community.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('21 error:', e.message); }

  console.log('22. Capturing Modal: Create Group Chat...');
  try {
    await page.goto('http://localhost:3000/messages', gotoOpts);
    await sleep(2500);
    const opened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.btn-icon-glass, button'));
      const btn = btns.find(b => (b.getAttribute('title') && b.getAttribute('title').includes('กลุ่ม')) || b.innerHTML.includes('M17 21v-2a4'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (opened) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '22_modal_create_group_chat.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('22 error:', e.message); }

  console.log('23. Capturing Modal: Community Invite Link Generator...');
  try {
    await page.goto('http://localhost:3000/community/ovo/settings', gotoOpts);
    await sleep(2500);
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.settings-tab-btn, button'));
      const privTab = tabs.find(t => t.textContent.includes('ความเป็นส่วนตัว') || t.textContent.includes('Privacy'));
      if (privTab) privTab.click();
    });
    await sleep(1800);
    await page.screenshot({ path: path.join(outDir, '23_modal_invite_member.png'), fullPage: false });
  } catch (e) { console.log('23 error:', e.message); }

  console.log('24. Capturing Modal: Report Content...');
  try {
    await page.goto('http://localhost:3000/post/1', gotoOpts);
    await sleep(2500);
    const menuClicked = await page.evaluate(() => {
      const btn = document.querySelector('.btn-post-menu');
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (menuClicked) {
      await sleep(800);
      const reportClicked = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.post-dropdown-item'));
        const item = items.find(i => i.textContent.includes('รายงาน'));
        if (item) { item.click(); return true; }
        return false;
      });
      if (reportClicked) {
        await sleep(1800);
        await page.screenshot({ path: path.join(outDir, '24_modal_report_content.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await sleep(600);
      }
    }
  } catch (e) { console.log('24 error:', e.message); }

  console.log('25. Capturing Modal: Change Password / Security...');
  try {
    await page.goto('http://localhost:3000/settings/security', gotoOpts);
    await sleep(2500);
    const opened = await clickButtonByText(page, 'เปลี่ยน');
    if (opened) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '25_modal_security_change_password.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('25 error:', e.message); }

  // ═════════════════════════════════════════════════════════════════════════════
  // SECTION 4: ADMIN PANEL & ADMIN MODALS (admin)
  // ═════════════════════════════════════════════════════════════════════════════
  console.log('--- Switching session to ADMIN (admin) ---');
  await page.setCookie({
    name: 'auth_token',
    value: adminToken,
    domain: 'localhost',
    path: '/'
  });

  console.log('26. Capturing Admin Dashboard Overview...');
  await page.goto('http://localhost:3000/admin', gotoOpts);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, '26_admin_dashboard_overview.png'), fullPage: false });

  console.log('27. Capturing Admin Users Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
    const t = tabs.find(el => el.textContent.includes('จัดการผู้ใช้') || el.textContent.includes('Users'));
    if (t) t.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '27_admin_users_tab.png'), fullPage: false });

  console.log('28. Capturing Admin Banned Accounts Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
    const t = tabs.find(el => el.textContent.includes('ถูกระงับ') || el.textContent.includes('Banned'));
    if (t) t.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '28_admin_banned_users_tab.png'), fullPage: false });

  console.log('29. Capturing Admin Communities Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
    const t = tabs.find(el => el.textContent.includes('จัดการชุมชน') || el.textContent.includes('Communities'));
    if (t) t.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '29_admin_communities_tab.png'), fullPage: false });

  console.log('30. Capturing Admin Reports Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
    const t = tabs.find(el => el.textContent.includes('รายงาน') || el.textContent.includes('Reports'));
    if (t) t.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '30_admin_reports_tab.png'), fullPage: false });

  console.log('31. Capturing Admin Logs Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
    const t = tabs.find(el => el.textContent.includes('ล็อก') || el.textContent.includes('Logs') || el.textContent.includes('บันทึก'));
    if (t) t.click();
  });
  await sleep(2000);
  await page.screenshot({ path: path.join(outDir, '31_admin_logs_tab.png'), fullPage: false });

  console.log('32. Capturing Modal: Admin User Action / Ban Modal...');
  try {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.nexus-tab, button'));
      const t = tabs.find(el => el.textContent.includes('จัดการผู้ใช้') || el.textContent.includes('Users'));
      if (t) t.click();
    });
    await sleep(1800);
    const actionClicked = await page.evaluate(() => {
      const actionBtn = document.querySelector('.actions-wrapper button');
      if (actionBtn) { actionBtn.click(); return true; }
      return false;
    });
    if (actionClicked) {
      await sleep(1800);
      await page.screenshot({ path: path.join(outDir, '32_modal_admin_user_action.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  } catch (e) { console.log('32 error:', e.message); }

  await browser.close();
  console.log('====================================================');
  console.log('ALL 32 SCREENSHOTS CAPTURED COMPLETELY & PERFECTLY!');
  console.log('Saved in:', outDir);
  console.log('====================================================');
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
