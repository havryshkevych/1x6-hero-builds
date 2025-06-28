import fs from 'fs';
import path from 'path';
import { DOWNLOAD_DIR } from './config';

const ROOT_README = 'README.md';

function toSlug(text: string) {
    return text.replace(/\s+/g, '_');
}

function generateHeroGrid(heroes: string[]): string {
    const rowLength = 6;
    const rows = [];

    for (let i = 0; i < heroes.length; i += rowLength) {
        const rowHeroes = heroes.slice(i, i + rowLength);
        const row = rowHeroes.map(hero => {
            const imgPath = `./${path.join(DOWNLOAD_DIR, hero, 'hero.png')}`.replace(/\\/g, '/');
            const linkPath = `./${path.join(DOWNLOAD_DIR, hero, 'README.md')}`.replace(/\\/g, '/');
            return `!${hero}\n\n [![${hero}](${imgPath})](${linkPath})`;
        }).join(' ');
        rows.push(row);
    }

    return rows.join('\n\n');
}

function generateReadmes() {
    const heroes = fs.readdirSync(DOWNLOAD_DIR).filter(name =>
        fs.statSync(path.join(DOWNLOAD_DIR, name)).isDirectory()
    );

    // === README.md для каждого героя ===
    for (const hero of heroes) {
        const heroDir = path.join(DOWNLOAD_DIR, hero);
        const heroReadmePath = path.join(heroDir, 'README.md');

        let heroContent = `# ${hero}\n\n`;

        heroContent += `![${hero}](./hero.png)\n`;
        for (let i = 0; i <= 4; i++) {
            const file = `tab_${i}.png`;
            const filePath = path.join(heroDir, file);
            if (fs.existsSync(filePath)) {
                heroContent += `![${file}](./${file})\n`;
            }
        }

        fs.writeFileSync(heroReadmePath, heroContent);
        console.log(`📝 README создан для ${hero}`);
    }

    // === Корневой README ===
    let rootContent = `# Dota 1x6 Hero Builds\n\n`;
    rootContent += `Нажми на аватар героя, чтобы открыть подробный билд\n\n`;
    rootContent += generateHeroGrid(heroes);

    fs.writeFileSync(ROOT_README, rootContent);
    console.log(`✅ Корневой README с аватарками обновлён`);
}

generateReadmes();
