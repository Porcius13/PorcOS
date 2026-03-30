import { GoogleGenAI } from "@google/genai";
import { Transaction, Summary } from "../types";

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

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const getChatResponse = async (messages: ChatMessage[], transactions: Transaction[], summary: Summary) => {
    const ai = getAI();
    if (!ai) return "AI Chat şu an devre dışı (API Anahtarı eksik).";

    const dataContext = `
        Kullanıcının mevcut finansal durumu:
        Toplam Gelir: ${summary.total_income}
        Toplam Gider: ${summary.total_expense}
        Bakiye: ${summary.total_income - summary.total_expense}
        Son İşlemler: ${transactions.slice(0, 5).map(t => `${t.description}: ${t.amount} (${t.type})`).join(', ')}
    `;

    const promptText = `
        Sen "BütçeDostu" uygulamasının akıllı finans asistanısın. Kullanıcıya harcamaları hakkında bilgi ver, tasarruf tavsiyeleri sun ve sorularını yanıtla.
        Kısa, samimi ve profesyonel ol. Türkçe konuş.
        
        Mevcut Veriler:
        ${dataContext}
        
        Geçmiş Konuşma:
        ${messages.map(m => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    parts: [{ text: promptText }]
                }
            ]
        });
        return response.text || "Şu an cevap veremiyorum.";
    } catch (error) {
        console.error("Chat failed:", error);
        return "Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar dene.";
    }
};
export const chatWithAI = async (prompt: string, transactions: Transaction[], summary: Summary) => {
    const ai = getAI();
    if (!ai) return "AI Chat şu an devre dışı.";

    const context = `
        Finansal Durum: Gelir ${summary.total_income}, Gider ${summary.total_expense}.
        Son İşlemler: ${transactions.slice(0, 3).map(t => `${t.description} (${t.amount})`).join(', ')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    parts: [{ text: `Bağlam: ${context}\n\nSoru: ${prompt}` }]
                }
            ]
        });
        return response.text || "Şu an cevap veremiyorum.";
    } catch (e) {
        return "İşlem sırasında bir hata oluştu.";
    }
};
