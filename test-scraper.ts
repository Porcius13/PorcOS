import { scrapeProduct } from './lib/favduck/scraper';

async function main() {
    try {
        console.log("Scraping...");
        const result = await scrapeProduct('https://www.decathlon.com.tr/p/erkek-sporcu-atleti-siyah/_/R-p-354238?mc=8912638');
        console.log("SUCCESS:", result);
    } catch (e) {
        console.error("ERROR:", e);
    }
}
main();
