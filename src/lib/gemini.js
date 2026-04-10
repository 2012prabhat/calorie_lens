import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeFood(base64Image) {
    try {
       const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Use the stable versioned name
    generationConfig: {
        responseMimeType: "application/json",
    }
});

        const prompt = `
        Analyze this food image and return a JSON object with these fields:
        {
          "name": "food name",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // With responseMimeType, 'text' is already a clean JSON string
        return JSON.parse(text);

    } catch (error) {
        // Detailed logging helps identify if it's an API Key issue or a Parsing issue
        console.error("Gemini Analysis Error:", error.message);
        throw new Error(`Food analysis failed: ${error.message}`);
    }
}