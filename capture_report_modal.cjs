const puppeteer = require('puppeteer-core');
const path = require('path');
const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const outDir = 'd:/ConnecXus/admin/screenshots';

(async () => {
  const r = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'Arm', password: '12345678A' })
  });
  const cookie = r.headers.get('set-cookie');
  const token = cookie.match(/auth_token=([^;]+)/)[1];

  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.setCookie({ name: 'auth_token', value: token, domain: 'localhost', path: '/' });

  console.log('Navigating to /community/ovo...');
  await page.goto('http://localhost:3000/community/ovo', { waitUntil: 'domcontentloaded' });
  await new Promise(res => setTimeout(res, 2500));

  const reportClicked = await page.evaluate(() => {
    const btn = document.querySelector('.btn-icon-danger, button[title*="รายงาน"]');
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Report button clicked on /community/ovo:', reportClicked);
  if (reportClicked) {
    await new Promise(res => setTimeout(res, 2000));
    await page.screenshot({ path: path.join(outDir, '24_modal_report_content.png'), fullPage: false });
  }

  await browser.close();
  console.log('Finished capturing 24_modal_report_content.png');
})();
