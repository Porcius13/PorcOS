import fs from 'fs';
import path from 'path';

const SRC = 'C:\\Users\\faxys\\OneDrive\\Desktop\\Bütçewebapp';
const DEST = 'C:\\Users\\faxys\\OneDrive\\Desktop\\Porcos\\personal-os';

function copyRecursive(src, dest, ignore = []) {
    if (ignore.includes(path.basename(src))) return;

    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName), ignore);
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 1. Copy lib (ignoring supabase)
copyRecursive(path.join(SRC, 'lib'), path.join(DEST, 'lib'), ['supabase', 'utils.ts']);
// ignoring utils.ts so we don't break personal-os shadcn config if they differ slightly

// 2. Copy components
copyRecursive(path.join(SRC, 'components'), path.join(DEST, 'components'), ['app-shell.tsx']);

// 3. Copy app/(dashboard) to app/kasa
// First, backup or remove existing Kasa page to avoid conflicts if needed, but we probably just overwrite
copyRecursive(path.join(SRC, 'app', '(dashboard)'), path.join(DEST, 'app', 'kasa'));

// 4. Find all .tsx files in DEST/components and DEST/app/kasa and update routing
function updateRoutes(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateRoutes(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // We need to rewrite `href="/..."` to `href="/kasa/..."` but NOT `href="/kasa..."` already or `href="/"` changing improperly.
            // Special case for dashboard root link
            content = content.replace(/href="\/dashboard"/g, 'href="/kasa"');
            content = content.replace(/href='\/dashboard'/g, "href='/kasa'");
            content = content.replace(/href={\`\/dashboard\`/g, "href={`/kasa`");

            // Rewrite other root routes inside the budget app like /analytics, /transactions, /budget
            const routes = ['analytics', 'budget', 'calendar', 'net-worth', 'recurring', 'savings', 'transactions'];
            for (const route of routes) {
                const regex1 = new RegExp(`href="/${route}"`, 'g');
                content = content.replace(regex1, `href="/kasa/${route}"`);

                const regex2 = new RegExp(`href={\`/${route}`, 'g');
                content = content.replace(regex2, `href={\`/kasa/${route}`);
            }

            // Also remove supabase imports if they managed to sneak into components
            if (content.includes('@/lib/supabase')) {
                content = content.replace(/import.*@\/lib\/supabase.*;/g, '// supabase import removed');
            }

            fs.writeFileSync(fullPath, content);
        }
    }
}

updateRoutes(path.join(DEST, 'components'));
updateRoutes(path.join(DEST, 'app', 'kasa'));

console.log('Merge script completed!');
