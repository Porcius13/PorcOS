import { ScrapedData, ScraperContext } from "./types";
import { smartPriceParse } from "./utils";

export async function nadirkitapScraper(context: ScraperContext): Promise<ScrapedData> {
    const { url } = context;
    
    // We import puppeteer directly here to bypass the globally configured getBrowser() 
    // which has too many stealth flags that trigger NadirKitap's Cloudflare.
    let browser: any = null;
    let page: any = null;
    
    const cleanUrlStr = url;

    try {
        let launchOptions: any;
        if (process.env.NODE_ENV === 'production') {
            const chromium = (await import('@sparticuz/chromium')).default;
            const puppeteerCore = (await import('puppeteer-core')).default;
            const chromiumAny = chromium as any;
            chromiumAny.setGraphicsMode = false;
            const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";
            launchOptions = {
                args: [...chromiumAny.args, "--no-sandbox", "--disable-setuid-sandbox"],
                defaultViewport: { width: 1920, height: 1080 },
                executablePath: await chromiumAny.executablePath(remoteExecutablePath),
                headless: chromiumAny.headless
            };
            browser = await puppeteerCore.launch(launchOptions);
        } else {
            const puppeteer = (await import('puppeteer')).default;
            browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        }

        page = await browser.newPage();
        
        // We set only a standard browser User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        await page.goto(cleanUrlStr, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const domData = await page.evaluate(() => {
            const result = { title: "", price: "", image: "", currency: "TRY", inStock: true, source: 'nadirkitap-dedicated' };
            
            // Try to find the sticky price
            const nkPrice = document.querySelector('.nk-sticky-current-price')?.textContent || 
                            document.querySelector('.centerSection p.mb-0')?.textContent ||
                            document.querySelector('.product-price')?.textContent;
            
            if (nkPrice) result.price = nkPrice;
            
            // Try to find the title
            result.title = (document.querySelector('h1.producTitle')?.textContent || 
                            document.querySelector('h1')?.textContent || "").trim();
            
            // Try to find the image
            result.image = document.querySelector('#urunAnaGorsel')?.getAttribute('src') || 
                           document.querySelector('.abigimage img')?.getAttribute('src') || "";
            
            return result;
        });

        // Additional JSON-LD extraction just in case
        try {
            const jsonLdData = await page.evaluate(() => {
                let price = "";
                let title = "";
                let image = "";
                const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                for (let i = 0; i < scripts.length; i++) {
                    try {
                        const data = JSON.parse(scripts[i].innerHTML);
                        const findProduct = (d: any): any => {
                            if (!d || typeof d !== 'object') return null;
                            if (Array.isArray(d)) return d.map(findProduct).find(p => p);
                            const type = d['@type'];
                            if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) return d;
                            for (const k in d) if (typeof d[k] === 'object') { const res = findProduct(d[k]); if (res) return res; }
                            return null;
                        };
                        const p = findProduct(data);
                        if (p) {
                            if (p.name) title = p.name;
                            if (p.image) image = Array.isArray(p.image) ? p.image[0] : p.image;
                            const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
                            if (offer && offer.price) price = offer.price;
                        }
                    } catch(e) {}
                }
                return { title, price, image };
            });

            if (!domData.price && jsonLdData.price) domData.price = jsonLdData.price;
            if (!domData.title && jsonLdData.title) domData.title = jsonLdData.title;
            if (!domData.image && jsonLdData.image) domData.image = jsonLdData.image;
        } catch(e) {}

        return {
            title: domData.title || "",
            price: smartPriceParse(domData.price),
            image: domData.image || "",
            currency: domData.currency || "TRY",
            description: "",
            inStock: domData.inStock,
            source: domData.source,
            rawTitle: domData.title,
            rawPrice: domData.price?.toString()
        };

    } catch (e: any) {
        throw new Error(`NadirKitap Scraper Error: ${e.message}`);
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
        // If it was called by scraper.ts, we should also try to close and release its context
        if (context.browser && context.browser !== browser) {
            await context.browser.close().catch(() => {});
        }
    }
}
