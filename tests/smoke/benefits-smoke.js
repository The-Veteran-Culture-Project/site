const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://localhost:4321/survey/benefits';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for the client-loaded component to mount
    await page.waitForSelector('#benefits-vaHealthcare-yes', { timeout: 10000 });
    await page.waitForSelector('#benefits-hasApplied-yes', { timeout: 10000 });

    // Ensure initial state: none of the benefits-prefixed radios are checked
    const initiallyChecked = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[type=radio][name^="benefits_"]')).filter(i => i.checked).map(i => i.id);
    });

    console.log('Initially checked radios:', initiallyChecked);

    // Click VA Healthcare -> Yes
    await page.click('#benefits-vaHealthcare-yes');
    await page.waitForTimeout(250);

    const afterClickChecked = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[type=radio][name^="benefits_"]')).filter(i => i.checked).map(i => ({ id: i.id, name: i.name, value: i.value }));
    });

    console.log('After clicking benefits-vaHealthcare-yes, checked:', afterClickChecked);

    // Check that only inputs in the same group were affected
    const otherGroupsChecked = afterClickChecked.filter(item => item.name !== 'benefits_vaHealthcare');

    if (otherGroupsChecked.length === 0) {
      console.log('PASS: Other benefit radio groups were not affected.');
      await browser.close();
      process.exit(0);
    } else {
      console.error('FAIL: The following inputs in other groups became checked:', otherGroupsChecked);
      await browser.close();
      process.exit(2);
    }
  } catch (err) {
    console.error('ERROR during smoke test:', err);
    await browser.close();
    process.exit(3);
  }
})();
