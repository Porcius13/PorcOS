import { ScrapedData, ScraperContext } from "./types";
import { smartPriceParse } from "./utils";

export async function swatchScraper(context: ScraperContext): Promise<ScrapedData> {
    const { page } = context;
    if (!page) {
        throw new Error("Swatch scraper requires a Puppeteer page instance");
    }

    try {
        // Swatch pricing is heavily dynamic. Wait for the price elements.
        await page.waitForSelector('.price .value, .sales .value, .b-product_addtocard-price_value', { timeout: 15000 }).catch(() => {});

        const result = await page.evaluate(() => {
            const data = { title: "", price: "", image: "", inStock: true };

            // Preferred title: h1
            data.title = document.querySelector('h1')?.textContent?.trim() || 
                         document.querySelector('.b-pdp_main_info-title')?.textContent?.trim() ||
                         document.title.split('|')[0].trim() ||
                         "";

            // Preferred price: The most specific one
            const priceEl = document.querySelector('.b-product_addtocard-price_value') || 
                            document.querySelector('.sales .value') ||
                            document.querySelector('.price .value') ||
                            document.querySelector('.price');
            
            data.price = priceEl?.textContent?.trim() || "";

            // Preferred image: PDP main image
            const imgEl = document.querySelector('.product-detail .primary-image img') || 
                          document.querySelector('.pdp-main-image img') || 
                          document.querySelector('meta[property="og:image"]');
                          
            data.image = imgEl?.getAttribute('src') || imgEl?.getAttribute('content') || "";

            // Check stock status
            const outOfStockStr = (document.body.innerText || "").toLowerCase();
            if (outOfStockStr.includes("tükendi") || 
                outOfStockStr.includes("stokta yok") || 
                document.querySelector('.b-product_addtocard-outofstock')) {
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
            source: "swatch"
        };
    } catch (error) {
        throw error;
    }
}
