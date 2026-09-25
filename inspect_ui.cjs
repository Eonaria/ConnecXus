const puppeteer = require('puppeteer-core');
const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

async function run() {
  const browser = await puppeteer.launch({ executablePath: bravePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  const inputs = await page.$$('input');
  await inputs[0].type('arm');
  await inputs[1].type('12345678A');
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = await page.evaluate(el => el.textContent, b);
    if (t.includes('เข้าสู่ระบบ') || t.includes('Login')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 3000));
  
  // Go to profile via sidebar click!
  console.log('Current URL after login:', page.url());
  const profileLink = await page.$('a[href*="/profile/"]');
  if (profileLink) {
    const href = await page.evaluate(el => el.getAttribute('href'), profileLink);
    console.log('Profile href in sidebar:', href);
    await profileLink.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Profile URL:', page.url());
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()));
    console.log('Buttons on profile:', buttons);
  }

  // Check messages buttons
  await page.goto('http://localhost:3000/messages', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const msgButtons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({ title: b.getAttribute('title'), text: b.innerText.trim(), class: b.className })));
  console.log('Buttons on messages:', msgButtons);

  await browser.close();
}

run().catch(console.error);
