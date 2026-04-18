import "server-only";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFoodFromText(userInput) {
  try {
    const prompt = `
You are a nutrition expert.

Analyze the following food input and estimate total nutritional values.

Input: "${userInput}"

Return ONLY a valid JSON object in this format:
{
  "items": [
    {
      "name": "food name",
      "quantity": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}

Important:
- Consider Indian foods like roti, sabzi, dal, etc.
- Use realistic average values
- Do not include any explanation, only JSON
`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = result.text;


    // 🧠 Clean JSON (sometimes Gemini adds ```json)
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Gemini Text Analysis Error:", error.message);
    throw new Error(`Food analysis failed: ${error.message}`);
  }
}