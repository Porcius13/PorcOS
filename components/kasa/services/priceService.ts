// components/kasa/services/priceService.ts

export interface AssetPrices {
    TRY: number;
    USD: number;
    EUR: number;
    GBP: number;
    GOLD_GRAM: number;
    updatedAt: string;
}

const CACHE_KEY = 'kasa_asset_prices';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const fetchAssetPrices = async (): Promise<AssetPrices> => {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
            return data;
        }
    }

    try {
        // We use a public API for FX rates (USD -> TRY etc)
        const fxResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxData = await fxResponse.json();
        
        const tryRate = fxData.rates.TRY;
        const eurRate = fxData.rates.EUR;
        const gbpRate = fxData.rates.GBP;

        // For Gold (XAU), pricing is usually per ounce (31.1g) in USD
        // We'll fetch from a public source or use a fallback if not available
        let goldOunceUsd = 2150; // Fallback
        try {
            const goldRes = await fetch('https://api.gold-api.com/price/XAU');
            const goldData = await goldRes.json();
            if (goldData.price) goldOunceUsd = goldData.price;
        } catch (e) {
            console.warn("Gold API failed, using fallback.");
        }

        const goldGramTry = (goldOunceUsd / 31.1) * tryRate;

        const prices = {
            TRY: 1,
            USD: tryRate,
            EUR: (1 / eurRate) * tryRate,
            GBP: (1 / gbpRate) * tryRate,
            GOLD_GRAM: goldGramTry,
            updatedAt: new Date().toISOString()
        };

        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: prices,
            timestamp: Date.now()
        }));

        return prices;
    } catch (error) {
        console.error("Failed to fetch asset prices:", error);
        // Returns minimal fallback to avoid UI crash
        return {
            TRY: 1,
            USD: 32.25,
            EUR: 35.10,
            GBP: 41.05,
            GOLD_GRAM: 2450.50,
            updatedAt: new Date().toISOString()
        };
    }
};
