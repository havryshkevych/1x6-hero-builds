import {chromium} from 'playwright';
import fs from 'fs';
import {BASE_URL, GUIDE_LIST_URL} from './config';

export async function fetchGuideLinks(): Promise<string[]> {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto(GUIDE_LIST_URL, { waitUntil: 'networkidle' });

    const links = await page.$$eval('main a[href*="/heroes/"]', anchors =>
        anchors.map(a => (a as HTMLAnchorElement).href)
    );

    // await browser.close();
    return Array.from(new Set(links)).filter(link => link.startsWith(BASE_URL));
}

(async () => {
    const links = await fetchGuideLinks();

    console.log(links);
})();
