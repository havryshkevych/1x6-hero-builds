import fs from 'fs';
import path from 'path';
import { DOWNLOAD_DIR } from './config';

const ROOT_README = 'README.md';

function generateReadmes() {
    const heroes = fs.readdirSync(DOWNLOAD_DIR).filter(name =>
        fs.statSync(path.join(DOWNLOAD_DIR, name)).isDirectory()
    );

    let rootContent = '# Гайды Dota 1x6\n\n';

    for (const hero of heroes) {
        const heroDir = path.join(DOWNLOAD_DIR, hero);
        const heroReadmePath = path.join(heroDir, 'README.md');

        // === Генерация README для героя ===
        let heroContent = `# ${hero}\n\n`;
        for (let i = 1; i <= 4; i++) {
            const file = `tab_${i}.png`;
            const filePath = path.join(heroDir, file);
            if (fs.existsSync(filePath)) {
                heroContent += `![${file}](./${file})\n`;
            }
        }

        fs.writeFileSync(heroReadmePath, heroContent);
        console.log(`📝 README создан для ${hero}`);

        // === Ссылка в корневом README ===
        rootContent += `- [${hero}](./${path.join(DOWNLOAD_DIR, hero, 'README.md')})\n`;
    }

    fs.writeFileSync(ROOT_README, rootContent);
    console.log(`✅ Корневой README обновлён (${heroes.length} героев)`);
}

generateReadmes();
