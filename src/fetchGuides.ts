import {chromium} from 'playwright';
import fs from 'fs';
import {BASE_URL, GUIDE_LIST_URL} from './config';

export async function fetchGuideLinks(): Promise<{ link: string; image: string | null }[]> {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto(GUIDE_LIST_URL, { waitUntil: 'networkidle' });

    const links = await page.$$eval('main a[href*="/heroes/"]', anchors =>
        anchors.map(a => (a as HTMLAnchorElement).href)
    );

    const heroData = await page.$$eval('main a[href*="/heroes/"]', anchors =>
        anchors.map(a => {
            const href = (a as HTMLAnchorElement).href;
            const img = a.querySelector('img');
            const imgSrc = img ? (img as HTMLImageElement).src : null;
            return { link: href, image: imgSrc };
        })
    );
    await browser.close();

    return heroData;
}

(async () => {
    const links = await fetchGuideLinks();

    console.log(links);
})();
