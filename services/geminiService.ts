
import { GoogleGenAI } from "@google/genai";

/* Secure initialization following best practices */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async getFeedSummary(posts: any[]) {
    if (!process.env.API_KEY) return "AI services are currently offline.";
    try {
      const prompt = `Here are some recent social media posts: ${posts.map(p => p.content).join(' | ')}. 
      Provide a concise 2-sentence summary of the current trending topics in this feed.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "Unable to generate AI summary at this moment.";
    }
  },

  async moderateContent(text: string) {
    if (!process.env.API_KEY) return "SAFE";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze if this text is appropriate for a social media platform: "${text}". Reply with "SAFE" or "REJECTED: [reason]".`,
      });
      return response.text;
    } catch (error) {
      return "SAFE";
    }
  }
};
