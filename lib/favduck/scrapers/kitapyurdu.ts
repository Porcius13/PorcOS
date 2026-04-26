import { ScrapedData, ScraperContext } from "./types";
import { smartPriceParse } from "./utils";

export async function kitapyurduScraper(context: ScraperContext): Promise<ScrapedData> {
    const { page } = context;
    if (!page) {
        throw new Error("Kitapyurdu scraper requires a Puppeteer page instance");
    }

    try {
        // Kitapyurdu pricing can be slow to render. Wait for the primary elements.
        await page.waitForSelector('.pr_header__title, h1, .price-new', { timeout: 15000 }).catch(() => {});

        const result = await page.evaluate(() => {
            const data = { title: "", price: "", image: "", inStock: true };

            data.title = document.querySelector('h1.pr_header__title')?.textContent?.trim() || 
                         document.querySelector('h1')?.textContent?.trim() || 
                         document.title.split('|')[0].trim() ||
                         "";

            const priceEl = document.querySelector('.price-new .value') || 
                            document.querySelector('.price-new') || 
                            document.querySelector('.price_item');
            
            data.price = priceEl?.textContent?.trim() || "";

            const imgEl = document.querySelector('#main-confirm-img') || 
                          document.querySelector('.pr_images__item img') || 
                          document.querySelector('meta[property="og:image"]');
                          
            data.image = imgEl?.getAttribute('src') || imgEl?.getAttribute('content') || "";

            // Check stock status
            const outOfStockStr = (document.body.innerText || "").toLowerCase();
            if (outOfStockStr.includes("tükendi") || 
                outOfStockStr.includes("stokta yok") || 
                outOfStockStr.includes("temin edilemiyor")) {
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
            source: "kitapyurdu"
        };
    } catch (error) {
        throw error;
    }
}
