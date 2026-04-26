import puppeteer from 'puppeteer';
import fs from 'fs';

async function testDecathlon() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    console.log("Navigating...");
    await page.goto("https://www.decathlon.com.tr/p/erkek-sporcu-atleti-siyah/_/R-p-354238?mc=8912638", { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Save screenshot
    await page.screenshot({ path: 'scratch1.png' });
    
    // Extract HTML
    const html = await page.content();
    fs.writeFileSync('scratch.html', html);
    
    // Try to find title, price, image using the current or alternative selectors
    const result = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || "";
        const priceEl = document.querySelector('.vtmn-price_size--large') || document.querySelector('.price') || document.querySelector('.prc-dsc') || document.querySelector('[data-v-price]');
        const price = priceEl ? priceEl.textContent?.trim() : "NOT FOUND";
        
        return { title, price };
    });
    
    console.log("RESULT:", result);
    await browser.close();
}

testDecathlon().catch(console.error);
