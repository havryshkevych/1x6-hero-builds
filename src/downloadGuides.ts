import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fetchGuideLinks } from './fetchGuides';
import { DOWNLOAD_DIR } from './config';

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();

    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await context.addCookies(cookies);
    console.log('start');
    const page = await context.newPage();
    const links = await fetchGuideLinks();
    console.log(links)
    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
    }

    for (const link of links) {
        console.log(`Сохраняю: ${link}`);
        await page.goto(link, { waitUntil: 'networkidle' });
        const itemsSelector = '#root > div > div > main > div > div:nth-child(3) > div';
        const tabSelector = '.flex.flex-row.items-center.gap-[8px] > div'; // или уточнить путь
        const tabBlock = page.locator('.flex.flex-row.items-center.gap-\\[8px\\]');
        const tabs = tabBlock.locator('> div');

        for (let i = 0; i <= 3; i++) {
            await tabs.nth(i).click();
            await page.waitForTimeout(500); // ждём обновление содержимого
            const block = await page.$(itemsSelector); // замени на реальный селектор!
            const box = await block?.boundingBox();
            if (box) {
                if (!fs.existsSync(DOWNLOAD_DIR + '/' + link.substring(link.lastIndexOf('/') + 1))) {
                    fs.mkdirSync(DOWNLOAD_DIR + '/' + link.substring(link.lastIndexOf('/') + 1));
                }
                await page.screenshot({
                    path: DOWNLOAD_DIR + '/' + link.substring(link.lastIndexOf('/') + 1) + `/tab_${i+1}.png`,
                    clip: {
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        height: box.height,
                    },
                });
                console.log(`✅ Скриншот вкладки ${i+1} сохранён`);
            } else {
                console.warn(`⚠️ Не удалось найти блок для вкладки ${i}`);
            }
        }
    }

    await browser.close();
})();
