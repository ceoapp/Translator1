import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateTextToThai = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a professional translator. Translate the following English text into natural-sounding Thai. 
      - Ensure the tone is polite (using polite particles like 'krub'/'ka' where appropriate) but natural.
      - Do not add any conversational filler before or after the translation.
      - Return ONLY the Thai translation.
      
      Text to translate:
      "${text}"`,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please try again.");
  }
};