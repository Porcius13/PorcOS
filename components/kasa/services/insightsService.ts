import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Summary } from "../types";

const getAI = () => {
    try {
        const key = 
            process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
            (import.meta as any).env?.VITE_GEMINI_API_KEY || 
            (process as any)?.env?.GEMINI_API_KEY || 
            "";
        if (!key) {
            console.warn("GEMINI_API_KEY is missing. AI Insights will be disabled.");
            return null;
        }
        return new GoogleGenAI({ apiKey: key });
    } catch (e) {
        return null;
    }
};

export const getFinancialInsights = async (transactions: Transaction[], summary: Summary) => {
    if (transactions.length === 0) return "Analiz için henüz yeterli veri yok. Harcama ekleyerek başlayın!";

    const ai = getAI();
    if (!ai) return "AI Özelliği devre dışı (API Anahtarı eksik). Lütfen bir anahtar ekleyin.";

    const dataContext = JSON.stringify({
        summary,
        recentTransactions: transactions.slice(0, 10).map(t => ({
            desc: t.description,
            amt: t.amount,
            cat: t.category_name,
            type: t.type
        }))
    });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    parts: [
                        {
                            text: `Sen profesyonel bir finansal danışmansın. Aşağıdaki harcama verilerine dayanarak kullanıcıya kısa, samimi ve aksiyon alınabilir bir tavsiye ver (Maksimum 2 cümle). Veri: ${dataContext}. Türkçe cevap ver.`,
                        },
                    ],
                },
            ],
        });

        return response.text || "Finansal durumun stabil görünüyor, böyle devam et!";
    } catch (error) {
        console.error('Insights failed:', error);
        return "Şu an için analiz yapılamıyor, lütfen daha sonra tekrar deneyin.";
    }
};

export const getSpendingForecast = async (transactions: Transaction[]) => {
    const ai = getAI();
    if (!ai) return [];

    const history = transactions.slice(0, 50).map(t => ({
        date: t.date,
        amt: t.amount,
        type: t.type
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    parts: [
                        {
                            text: `Sen bir veri bilimcisin. Aşağıdaki geçmiş finansal verilere dayanarak gelecek 3 ay için harcama tahmini yap.
                            Veri: ${JSON.stringify(history)}
                            
                            Lütfen şu formatta JSON dizisi döndür:
                            [{"month": "Mart 2024", "predicted": 12000, "actual": 0}, ...]
                            
                            Sadece JSON dizisi döndür.`,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            month: { type: Type.STRING },
                            predicted: { type: Type.NUMBER },
                            actual: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        return JSON.parse(response.text || "[]");
    } catch (error) {
        return [];
    }
};

export const getFinancialHealthScore = async (transactions: Transaction[], summary: Summary) => {
    const ai = getAI();
    if (!ai) return 72;

    const context = {
        income: summary.total_income,
        expense: summary.total_expense,
        ratio: summary.total_income > 0 ? (summary.total_expense / summary.total_income) : 1,
        transactionCount: transactions.length
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                parts: [{
                    text: `Aşağıdaki finansal verilere dayanarak kullanıcıya 0-100 arası bir "Finansal Sağlık Skoru" ver. 
                    Veri: ${JSON.stringify(context)}
                    Sadece bir sayı döndür.`
                }]
            }]
        });
        const scoreStr = response.text || "72";
        const score = parseInt(scoreStr.trim());
        return isNaN(score) ? 72 : score;
    } catch (e) {
        return 72;
    }
};

export const getFinancialMetrics = (transactions: Transaction[], summary: Summary) => {
    const burnRate = summary.total_expense / 30;
    const savingsVelocity = summary.total_income - summary.total_expense;
    const efficiency = summary.total_income > 0 ? (1 - (summary.total_expense / summary.total_income)) * 100 : 0;

    return {
        burnRate,
        savingsVelocity,
        efficiency
    };
};
