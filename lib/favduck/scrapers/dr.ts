import { ScrapedData, ScraperContext } from "./types";
import { smartPriceParse } from "./utils";

export async function drScraper(context: ScraperContext): Promise<ScrapedData> {
    const { page } = context;
    if (!page) {
        throw new Error("D&R scraper requires a Puppeteer page instance");
    }

    try {
        // Wait for basic layout
        await page.waitForSelector('h1, .price-box, .product-img', { timeout: 15000 }).catch(() => {});

        // D&R uses placeholders for images. Wait for them to load.
        await page.waitForFunction(() => {
            const img = document.querySelector('#main-product-img') as HTMLImageElement;
            return img && img.src && !img.src.includes('loading.gif');
        }, { timeout: 10000 }).catch(() => {});

        const result = await page.evaluate(() => {
            const data = { title: "", price: "", image: "", inStock: true };

            data.title = document.querySelector('h1')?.innerText || 
                         document.title.split('|')[0].trim() || 
                         "";

            const priceEl = document.querySelector('.salePrice') || 
                            document.querySelector('.price-box .price') ||
                            document.querySelector('.currentPrice') ||
                            document.querySelector('[itemprop="price"]');
            
            data.price = priceEl?.textContent?.trim() || "";

            // Better image prioritization
            data.image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                          document.querySelector('#main-product-img')?.getAttribute('src') ||
                          document.querySelector('.product-img img')?.getAttribute('src') || "";
            
            // Skip loading gif
            if (data.image.includes('loading.gif')) data.image = "";

            // Check stock
            const outOfStockStr = (document.body.innerText || "").toLowerCase();
            if (outOfStockStr.includes("tükendi") || outOfStockStr.includes("stokta yok")) {
                data.inStock = false;
            }

            return data;
        });

        return {
            title: result.title || "İsimsiz Ürün",
            price: smartPriceParse(result.price),
            image: result.image || "https://placehold.co/600x800?text=Gorsel+Yok",
            currency: "TRY",
            description: "",
            inStock: result.inStock,
            source: "dr.com.tr"
        };
    } catch (error) {
        throw error;
    }
}
