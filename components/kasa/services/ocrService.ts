import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
    try {
        const key = 
            (process.env.NEXT_PUBLIC_GEMINI_API_KEY) ||
            (import.meta as any).env?.VITE_GEMINI_API_KEY || 
            (process as any)?.env?.GEMINI_API_KEY || 
            "";
        if (!key) return null;
        return new GoogleGenAI({ apiKey: key });
    } catch (e) {
        return null;
    }
};

export const scanReceipt = async (fileData: string, mimeType: string) => {
    const ai = getAI();
    if (!ai) throw new Error("AI functionality is currently unavailable - API Key missing.");

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            {
                parts: [
                    {
                        inlineData: {
                            data: fileData.split(',')[1],
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Bu bir harcama fişi/faturası görselidir. Lütfen görseli analiz et ve JSON formatında şu bilgileri çıkar:
                        - amount (sayısal tutar)
                        - description (harcama yapılan yer/açıklama)
                        - date (eğer varsa YYYY-MM-DD formatında, yoksa bugünün tarihi)
                        - category_suggestion (Gıda, Alışveriş, Ulaşım, Faturalar, Diğer gibi uygun bir kategori)
                        
                        Sadece JSON nesnesi döndür.`,
                    },
                ],
            },
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    amount: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    date: { type: Type.STRING },
                    category_suggestion: { type: Type.STRING },
                    type: { type: Type.STRING, description: "always expense for receipts" },
                },
                required: ["amount", "description", "category_suggestion"],
            },
        },
    });

    return JSON.parse(response.text || "{}");
};
