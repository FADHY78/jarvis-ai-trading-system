
import { GoogleGenAI, Type } from "@google/genai";

export interface NewsHeadline {
  title: string;
  summary: string;
  source: string;
  time: string;
  relevance: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  url?: string;
}

export async function fetchLiveTradingNews(): Promise<NewsHeadline[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Identify the top 6 real-time financial news headlines and market developments happening right now that would impact currency, synthetic, and commodity traders. Provide brief summaries, sources, and a sentiment analysis (positive, neutral, or negative) for each based on its likely market impact.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              time: { type: Type.STRING },
              relevance: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
              sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] }
            },
            required: ["title", "summary", "source", "time", "relevance", "sentiment"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty news response");
    
    const news: NewsHeadline[] = JSON.parse(text);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
      news.forEach((item, index) => {
        const chunk = groundingChunks[index];
        if (chunk?.web?.uri) {
          item.url = chunk.web.uri;
        } else if (groundingChunks.length > 0) {
          item.url = groundingChunks[0]?.web?.uri;
        }
      });
    }

    return news;
  } catch (error: any) {
    // Handle rate limit gracefully
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.warn('⚠️ Gemini API quota exceeded - using fallback news data');
    } else {
      console.error("Global News Intelligence System failed:", error);
    }
    return [
      {
        title: "Volatility remains the dominant theme in global markets",
        summary: "Institutional desks report high volume as markets react to unconfirmed geopolitical shifts.",
        source: "Bloomberg Terminal (Simulated)",
        time: "1m ago",
        relevance: 'high',
        sentiment: 'neutral'
      },
      {
        title: "Synthetic indices showing stable algorithmic patterns",
        summary: "Volatility 75 and Boom/Crash markets maintain technical structural integrity.",
        source: "Deriv Intelligence",
        time: "5m ago",
        relevance: 'medium',
        sentiment: 'positive'
      }
    ];
  }
}
