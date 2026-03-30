import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const key = 
    (process.env.NEXT_PUBLIC_GEMINI_API_KEY) || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    (process as any)?.env?.GEMINI_API_KEY || 
    "";
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeStatement = async (fileData: string, mimeType: string) => {
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
            text: `Bu bir kredi kartı ekstresi dosyasıdır (görsel veya PDF). Lütfen bu dosyadaki harcamaları analiz et ve JSON formatında döndür. 
            Ayrıca ekstrenin hangi bankaya ait olduğunu ve hangi dönemi (ay/yıl) kapsadığını tespit et.
            
            Önemli: 
            - Mağaza alışverişleri, yemek, fatura gibi harcamaları 'expense' olarak işaretle.
            - Borç ödemeleri (EFT/Havale ile yapılan ödemeler), iadeler veya hesaba gelen paraları 'income' olarak işaretle.
            
            JSON formatı:
            {
              "statement_info": {
                "bank_name": "Banka adı",
                "period": "Ay Yıl (Örn: Mart 2024)",
                "total_amount": toplam borç miktarı
              },
              "transactions": [
                {
                  "amount": sayısal değer,
                  "description": "harcama yeri",
                  "date": "YYYY-MM-DD",
                  "category_suggestion": "Gıda, Kira, Ulaşım, Eğlence, Sağlık, Alışveriş, Faturalar, Diğer",
                  "type": "income" veya "expense"
                }
              ]
            }`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          statement_info: {
            type: Type.OBJECT,
            properties: {
              bank_name: { type: Type.STRING },
              period: { type: Type.STRING },
              total_amount: { type: Type.NUMBER },
            },
            required: ["bank_name", "period"],
          },
          transactions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                description: { type: Type.STRING },
                date: { type: Type.STRING },
                category_suggestion: { type: Type.STRING },
                type: { type: Type.STRING },
              },
              required: ["amount", "description", "date", "category_suggestion", "type"],
            },
          },
        },
        required: ["statement_info", "transactions"],
      },
    },
  });

  const textResponse = response.text || "";
  return JSON.parse(textResponse || "{}");
};
