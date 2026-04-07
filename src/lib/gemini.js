import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeFood(base64Image) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // fast & good for images
        });

        const prompt = `
        Analyze this food image and return ONLY valid JSON in this format:

        {
          "name": "food name",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }

        Do not return anything else.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
        ]);

        const text = result.response.text();

        // Clean Gemini response (important!)
        const cleaned = text.replace(/```json|```/g, "").trim();

        return JSON.parse(cleaned);

    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("Failed to analyze food");
    }
}