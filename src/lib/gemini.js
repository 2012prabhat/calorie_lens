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

export async function analyzeFoodByImage(base64Data, mimeType) {
  try {
    const prompt = `
      You are a nutrition expert. Analyze the food in this image.
      Return a valid JSON object with the following structure:
      {
        "items": [{ "name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number }],
        "total": { "calories": number, "protein": number, "carbs": number, "fat": number }
      }
      Consider Indian cuisine, use realistic portion estimates, and output ONLY the JSON.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: { data: base64Data, mimeType: mimeType }
        },
        prompt
      ],
      config: {
        // Enforces structured JSON output
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(result.text);

  } catch (error) {
    console.error("Gemini Image Analysis Error:", error.message);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}