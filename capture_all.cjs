const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const outDir = 'd:/ConnecXus/admin/screenshots';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching browser at:', bravePath);
  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  // Set nice viewport
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  console.log('1. Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.waitForTimeout ? page.waitForTimeout(1000) : new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '01_login_page.png'), fullPage: false });

  console.log('2. Capturing Register Page...');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '02_register_page.png'), fullPage: false });

  console.log('3. Logging in as USER: arm ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Find login inputs
  const inputs = await page.$$('input');
  console.log('Found inputs on login page:', inputs.length);

  // Type username and password
  if (inputs.length >= 2) {
    await inputs[0].type('arm');
    await inputs[1].type('12345678A');
    
    // Find and click submit button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('เข้าสู่ระบบ') || text.includes('Login') || text.includes('Sign in'))) {
        console.log('Clicking login button:', text.trim());
        await btn.click();
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  console.log('Current URL after user login:', page.url());

  // If login redirected to home
  console.log('4. Capturing Home Feed (User: arm)...');
  await page.screenshot({ path: path.join(outDir, '03_user_home_feed.png'), fullPage: false });

  // Post composer focused
  try {
    const composer = await page.$('.tiptap, textarea, [contenteditable="true"]');
    if (composer) {
      await composer.click();
      await page.keyboard.type('ยินดีต้อนรับสู่ ConnecXus แพลตฟอร์มโซเชียลมีเดียยุคใหม่!');
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, '04_user_post_composer.png'), fullPage: false });
    }
  } catch (e) {
    console.log('Composer capture notice:', e.message);
  }

  console.log('5. Capturing Explore Page...');
  await page.goto('http://localhost:3000/explore', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '05_user_explore.png'), fullPage: false });

  console.log('6. Capturing Notifications Page...');
  await page.goto('http://localhost:3000/notifications', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '06_user_notifications.png'), fullPage: false });

  console.log('7. Capturing Bookmarks Page...');
  await page.goto('http://localhost:3000/bookmarks', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '07_user_bookmarks.png'), fullPage: false });

  console.log('8. Capturing Messages / Chat Page...');
  await page.goto('http://localhost:3000/messages', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '08_user_messages.png'), fullPage: false });

  console.log('9. Capturing Community Explorer Page...');
  await page.goto('http://localhost:3000/community', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '09_user_community_list.png'), fullPage: false });

  // Check if any community exists to view detail
  try {
    const commLinks = await page.$$('a[href^="/community/"]');
    if (commLinks.length > 0) {
      const href = await page.evaluate(el => el.getAttribute('href'), commLinks[0]);
      if (href && href !== '/community') {
        console.log('10. Capturing Community Detail Page:', href);
        await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outDir, '10_community_detail.png'), fullPage: false });

        console.log('11. Capturing Community Settings...');
        await page.goto(`http://localhost:3000${href}/settings`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outDir, '11_community_settings.png'), fullPage: false });
      }
    }
  } catch (e) {
    console.log('Community subpages notice:', e.message);
  }

  console.log('12. Capturing User Profile Page (arm)...');
  await page.goto('http://localhost:3000/profile/arm', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '12_user_profile.png'), fullPage: false });

  console.log('13. Capturing Security Settings Page...');
  await page.goto('http://localhost:3000/settings/security', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '13_user_security_settings.png'), fullPage: false });

  // Clear cookies and storage for ADMIN login
  console.log('--- Switching to ADMIN session ---');
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Storage.clearDataForOrigin', { origin: 'http://localhost:3000', storageTypes: 'all' });

  console.log('14. Logging in as ADMIN: admin ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const adminInputs = await page.$$('input');
  if (adminInputs.length >= 2) {
    await adminInputs[0].type('admin');
    await adminInputs[1].type('admin1234');
    
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('เข้าสู่ระบบ') || text.includes('Login') || text.includes('Sign in'))) {
        console.log('Clicking admin login button:', text.trim());
        await btn.click();
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 3000));
  console.log('Current URL after admin login:', page.url());

  console.log('15. Capturing Admin Dashboard (/admin)...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '14_admin_dashboard_overview.png'), fullPage: false });

  // Click through Admin Tabs (Users, Communities, Reports, Logs)
  try {
    const tabs = await page.$$('button, [role="tab"]');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && (text.includes('ผู้ใช้') || text.includes('Users') || text.includes('สมาชิก'))) {
        console.log('Clicking Admin Users Tab:', text.trim());
        await tab.click();
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, '15_admin_users_tab.png'), fullPage: false });
        break;
      }
    }
    
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && (text.includes('ชุมชน') || text.includes('Communities') || text.includes('กลุ่ม'))) {
        console.log('Clicking Admin Communities Tab:', text.trim());
        await tab.click();
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, '16_admin_communities_tab.png'), fullPage: false });
        break;
      }
    }

    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && (text.includes('รายงาน') || text.includes('Reports'))) {
        console.log('Clicking Admin Reports Tab:', text.trim());
        await tab.click();
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, '17_admin_reports_tab.png'), fullPage: false });
        break;
      }
    }

    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && (text.includes('ประวัติ') || text.includes('Logs') || text.includes('บันทึก'))) {
        console.log('Clicking Admin Logs Tab:', text.trim());
        await tab.click();
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, '18_admin_logs_tab.png'), fullPage: false });
        break;
      }
    }
  } catch (e) {
    console.log('Admin tabs notice:', e.message);
  }

    // ------- Capture Modal dialogs (User) -------
async function clickButtonByText(text) {
  const clicked = await page.evaluate(t => {
    const xpath = `//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${t.toLowerCase()}')]`;

    if (result) { result.click(); return true; }
    return false;
  }, text);
  return clicked;
}

// 1. Create Post Modal
try {
  console.log('19. Capturing Create Post Modal...');
  const opened = await clickButtonByText('สร้างโพสต์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '19_create_post_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Create Post Modal notice:', e.message); }

// 2. Edit Profile Modal
try {
  console.log('20. Capturing Edit Profile Modal...');
  const opened = await clickButtonByText('แก้ไขโปรไฟล์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '20_edit_profile_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Edit Profile Modal notice:', e.message); }

// 3. Report Post Modal
try {
  console.log('21. Capturing Report Post Modal...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const postHref = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/post/"]');
    return el ? el.getAttribute('href') : null;
  });
  if (postHref) {
    await page.goto(`http://localhost:3000${postHref}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const opened = await clickButtonByText('รายงาน');
    if (opened) {
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '21_report_post_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  }
} catch (e) { console.log('Report Post Modal notice:', e.message); }

// 4. Invite User Modal (Community Settings)
try {
  console.log('22. Capturing Invite User Modal...');
  const opened = await clickButtonByText('เชิญ');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '22_invite_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Invite User Modal notice:', e.message); }

// 5. Settings Security Modal
try {
  console.log('23. Capturing Settings Security Modal...');
  const opened = await clickButtonByText('เปลี่ยน');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '23_security_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Security Modal notice:', e.message); }

// ------- Capture Modal dialogs (Admin) -------
try {
  console.log('24. Capturing Admin Add User Modal...');
  const opened = await clickButtonByText('เพิ่มผู้ใช้');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '24_admin_add_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Admin Add User Modal notice:', e.message); }


  





  return clicked;
}

// 1. Create Post Modal
try {
  console.log('19. Capturing Create Post Modal...');
  const opened = await clickButtonByText('สร้างโพสต์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '19_create_post_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Create Post Modal notice:', e.message); }

// 2. Edit Profile Modal
try {
  console.log('20. Capturing Edit Profile Modal...');
  const opened = await clickButtonByText('แก้ไขโปรไฟล์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '20_edit_profile_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Edit Profile Modal notice:', e.message); }

// 3. Report Post Modal
try {
  console.log('21. Capturing Report Post Modal...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const postHref = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/post/"]');
    return el ? el.getAttribute('href') : null;
  });
  if (postHref) {
    await page.goto(`http://localhost:3000${postHref}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const opened = await clickButtonByText('รายงาน');
    if (opened) {
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '21_report_post_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  }
} catch (e) { console.log('Report Post Modal notice:', e.message); }

// 4. Invite User Modal (Community Settings)
try {
  console.log('22. Capturing Invite User Modal...');
  const opened = await clickButtonByText('เชิญ');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '22_invite_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Invite User Modal notice:', e.message); }

// 5. Settings Security Modal
try {
  console.log('23. Capturing Settings Security Modal...');
  const opened = await clickButtonByText('เปลี่ยน');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '23_security_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Security Modal notice:', e.message); }

// ------- Capture Modal dialogs (Admin) -------
// 6. Admin Add User Modal
try {
  console.log('24. Capturing Admin Add User Modal...');
  const opened = await clickButtonByText('เพิ่มผู้ใช้');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '24_admin_add_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Admin Add User Modal notice:', e.message); }


  


    if (result) { result.click(); return true; }
    return false;
  }, text);
  return clicked;
}

// 1. Create Post Modal
try {
  console.log('19. Capturing Create Post Modal...');
  const opened = await clickButtonByText('สร้างโพสต์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '19_create_post_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Create Post Modal notice:', e.message); }

// 2. Edit Profile Modal
try {
  console.log('20. Capturing Edit Profile Modal...');
  const opened = await clickButtonByText('แก้ไขโปรไฟล์');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '20_edit_profile_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Edit Profile Modal notice:', e.message); }

// 3. Report Post Modal
try {
  console.log('21. Capturing Report Post Modal...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const postHref = await page.evaluate(() => {
    const el = document.querySelector('a[href*="/post/"]');
    return el ? el.getAttribute('href') : null;
  });
  if (postHref) {
    await page.goto(`http://localhost:3000${postHref}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const opened = await clickButtonByText('รายงาน');
    if (opened) {
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '21_report_post_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  }
} catch (e) { console.log('Report Post Modal notice:', e.message); }

// 4. Invite User Modal (Community Settings)
try {
  console.log('22. Capturing Invite User Modal...');
  const opened = await clickButtonByText('เชิญ');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '22_invite_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Invite User Modal notice:', e.message); }

// 5. Settings Security Modal
try {
  console.log('23. Capturing Settings Security Modal...');
  const opened = await clickButtonByText('เปลี่ยน');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '23_security_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Security Modal notice:', e.message); }

// ------- Capture Modal dialogs (Admin) -------
// 6. Admin Add User Modal
try {
  console.log('24. Capturing Admin Add User Modal...');
  const opened = await clickButtonByText('เพิ่มผู้ใช้');
  if (opened) {
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '24_admin_add_user_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }
} catch (e) { console.log('Admin Add User Modal notice:', e.message); }
  // 1. Create Post Modal
  try {
    console.log('19. Capturing Create Post Modal...');
    const createBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'สร้างโพสต์')]");
    if (createBtn.length) {
      
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '19_create_post_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { console.log('Create Post Modal notice:', e.message); }

  // 2. Edit Profile Modal
  try {
    console.log('20. Capturing Edit Profile Modal...');
    const editBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'แก้ไขโปรไฟล์')]");
    if (editBtn.length) {
      await editBtn[0].click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '20_edit_profile_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { console.log('Edit Profile Modal notice:', e.message); }

  // 3. Report Post Modal
  try {
    console.log('21. Capturing Report Post Modal...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    const postLink = await page.$x("//a[contains(@href, '/post/')]");
    if (postLink.length) {
      const href = await page.evaluate(el => el.getAttribute('href'), postLink[0]);
      await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1000));
      const reportBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'รายงาน')]");
      if (reportBtn.length) {
        await reportBtn[0].click();
        await new Promise(r => setTimeout(r, 1200));
        await page.screenshot({ path: path.join(outDir, '21_report_post_modal.png'), fullPage: false });
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      }
    }
  } catch (e) { console.log('Report Post Modal notice:', e.message); }

  // 4. Invite User Modal
  try {
    console.log('22. Capturing Invite User Modal...');
    const inviteBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'เชิญ')]");
    if (inviteBtn.length) {
      await inviteBtn[0].click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '22_invite_user_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { console.log('Invite User Modal notice:', e.message); }

  // 5. Settings Security Modal
  try {
    console.log('23. Capturing Settings Security Modal...');
    const secBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'เปลี่ยน')]");
    if (secBtn.length) {
      await secBtn[0].click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '23_security_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { console.log('Security Modal notice:', e.message); }

  // ------- Capture Modal dialogs (Admin) -------
  // 6. Admin Add User Modal
  try {
    console.log('24. Capturing Admin Add User Modal...');
    const addUserBtn = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'เพิ่มผู้ใช้')]");
    if (addUserBtn.length) {
      await addUserBtn[0].click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '24_admin_add_user_modal.png'), fullPage: false });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (e) { console.log('Admin Add User Modal notice:', e.message); }

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY in:', outDir);
}

run().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
