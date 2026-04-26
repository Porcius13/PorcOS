import { ScrapedData, ScraperContext } from "./types";
import { smartPriceParse } from "./utils";

export async function decathlonScraper(context: ScraperContext): Promise<ScrapedData> {
    const { page, url } = context;
    if (!page) {
        throw new Error("Decathlon scraper requires a Puppeteer page instance");
    }

    try {
        // Wait specifically for decathlon's price element to load
        // Decathlon uses heavy JS SPA rendering
        await page.waitForSelector('.vtmn-price_size--large, .prc-dsc, [itemprop="price"], .price-presentation', { timeout: 10000 }).catch(() => {});

        const result = await page.evaluate(() => {
            const data = { title: "", price: "", image: "", inStock: true };

            data.title = document.querySelector('h1')?.textContent?.trim() || 
                         document.title.split('-')[0].trim() || 
                         "";

            const priceEl = document.querySelector('.price-presentation') ||
                            document.querySelector('.vtmn-price_size--large') || 
                            document.querySelector('[itemprop="price"]') || 
                            document.querySelector('.price');
            
            data.price = priceEl?.textContent?.trim() || "";

            const imgEl = document.querySelector('img.swiper-media__image') || 
                          document.querySelector('.slick-current img') || 
                          document.querySelector('img[src*="contents.mediadecathlon.com"]') || 
                          document.querySelector('meta[property="og:image"]');
                          
            data.image = imgEl?.getAttribute('src') || imgEl?.getAttribute('content') || "";

            // Check stock status
            const outOfStockStr = (document.body.innerText || "").toLowerCase();
            if (outOfStockStr.includes("tükendi") || 
                outOfStockStr.includes("stokta yok") || 
                outOfStockStr.includes("out of stock") ||
                document.querySelector('.add-to-cart-out-of-stock')) {
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
            source: "decathlon"
        };
    } catch (error) {
        throw error;
    }
}
