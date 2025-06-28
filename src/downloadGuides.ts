import fs from 'fs';
import https from 'https';
import path from 'path';
import { chromium } from 'playwright';
import { fetchGuideLinks } from './fetchGuides';
import { DOWNLOAD_DIR } from './config';


async function downloadImage(imageUrl: string, savePath: string) {
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(savePath);
        https.get(imageUrl, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch image: ${response.statusCode} ${response.statusMessage}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Аватар героя сохранён`);
                resolve(null);
            });
        }).on('error', (error: any) => {
            fs.unlinkSync(savePath);
            console.error(`⚠️ Error downloading image:`, error);
            reject(error);
        });
    });

}

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

    for (const hero of links) {
        console.log(`Сохраняю: ${hero.link}`);
        await page.goto(hero.link, { waitUntil: 'networkidle' });
        const heroSelector = '#root > div > div > main > div > div:nth-child(2) > div';
        await page.waitForTimeout(500);
        const block = await page.$(heroSelector); // замени на реальный селектор!
        const box = await block?.boundingBox();
        if (hero.image) {
            try {
                const heroName = hero.link.split('/').pop() || 'unknown';
                const savePath = path.join(DOWNLOAD_DIR, heroName, 'avatar.png');
                await downloadImage(hero.image, savePath);
            } catch (error) {
                console.error(`⚠️ Failed to download image for hero: ${hero.link.substring(hero.link.lastIndexOf('/')+1)}`, error);
            }
        } else {
            console.warn(`⚠️ No image source found for hero: ${hero.link}`);
        }

        if (box) {
            await page.screenshot({
                path: DOWNLOAD_DIR + '/' + hero.link.substring(hero.link.lastIndexOf('/') + 1) + `/hero.png`,
                clip: {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                },
            });
            console.log(`✅ Скриншот героя сохранён`);
        }

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
                if (!fs.existsSync(DOWNLOAD_DIR + '/' + hero.link.substring(hero.link.lastIndexOf('/') + 1))) {
                    fs.mkdirSync(DOWNLOAD_DIR + '/' + hero.link.substring(hero.link.lastIndexOf('/') + 1));
                }
                await page.screenshot({
                    path: DOWNLOAD_DIR + '/' + hero.link.substring(hero.link.lastIndexOf('/') + 1) + `/tab_${i+1}.png`,
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
