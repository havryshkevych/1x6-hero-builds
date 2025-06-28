import fs from 'fs';
import path from 'path';
import { DOWNLOAD_DIR } from './config';

const README_PATH = 'README.md';

function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы с 0
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function generateReadme() {
    const heroes = fs.readdirSync(DOWNLOAD_DIR).filter(name =>
        fs.statSync(path.join(DOWNLOAD_DIR, name)).isDirectory()
    );

    const today = formatDate(new Date());
    let content = `# Скриншоты гайдов Dota 1x6 (обновлено ${today})\n\n`;

    for (const hero of heroes) {
        content += `## ${hero}\n\n`;
        for (let i = 1; i <= 4; i++) {
            const imagePath = path.join(DOWNLOAD_DIR, hero, `tab_${i}.png`);
            if (fs.existsSync(imagePath)) {
                const relativePath = path.relative('.', imagePath).replace(/\\/g, '/');
                content += `![tab_${i}](${relativePath})\n`;
            }
        }
        content += '\n\n';
    }

    fs.writeFileSync(README_PATH, content);
    console.log(`✅ README.md обновлён (${heroes.length} героев)`);
}

generateReadme();
