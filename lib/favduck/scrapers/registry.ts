import { ScraperFunction } from "./types";
import { hmScraper } from "./hm";
import { maviScraper } from "./mavi";
import { zaraScraper } from "./zara";
import { mangoScraper } from "./mango";
import { beymenScraper } from "./beymen";
import { amazonScraper } from "./amazon";
import { trendyolScraper } from "./trendyol";
import { genericScraper } from "./generic";
import { lcwScraper } from "./lcw";
import { defactoScraper } from "./defacto";
import { mediamarktScraper } from "./mediamarkt";
import { supplementlerScraper } from "./supplementler";
import { decathlonScraper } from "./decathlon";

import { kitapyurduScraper } from "./kitapyurdu";
import { drScraper } from "./dr";
import { swatchScraper } from "./swatch";
import { nadirkitapScraper } from "./nadirkitap";

export function getScraper(domain: string): ScraperFunction {
    if (domain.includes("nadirkitap.com")) return nadirkitapScraper;
    if (domain.includes("swatch.com")) return swatchScraper;
    if (domain.includes("dr.com.tr")) return drScraper;
    if (domain.includes("kitapyurdu.com")) return kitapyurduScraper;
    if (domain.includes("beymen.com")) return beymenScraper;
    if (domain.includes("mango.com")) return mangoScraper;
    if (domain.includes("hm.com")) return hmScraper;
    if (domain.includes("mavi.com")) return maviScraper;
    if (domain.includes("zara.com")) return zaraScraper;
    if (domain.includes("amazon.")) return amazonScraper;
    if (domain.includes("trendyol.com")) return trendyolScraper;
    if (domain.includes("lcw.com") || domain.includes("lcwaikiki.com")) return lcwScraper;
    if (domain.includes("defacto.com")) return defactoScraper;
    if (domain.includes("mediamarkt.com.tr")) return mediamarktScraper;
    if (domain.includes("supplementler.com") || domain.includes("vitaminler.com")) return supplementlerScraper;
    if (domain.includes("decathlon.")) return decathlonScraper;

    // Default to generic (which handles Shopify, Meta, JSON-LD)
    return genericScraper;
}
