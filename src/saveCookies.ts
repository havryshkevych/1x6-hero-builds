import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://dota1x6.com/');
    console.log('Войди вручную и нажми Enter...');
    await new Promise((resolve) => process.stdin.once('data', resolve));

    const cookies = await context.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    await browser.close();
})();
