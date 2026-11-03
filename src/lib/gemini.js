import "server-only";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFoodFromText(userInput) {
  try {
    const prompt = `
You are an expert clinical nutritionist and food recognition engine.
Analyze the following user food input.

First, determine if the input represents genuine edible food, meal, ingredients, groceries, snacks, recipes, or beverages.
If the input is NOT food/drink (for example: electronics, cars, clothing, animals, nonsensical text, random objects, or non-edible items):
Return strictly valid JSON:
{
  "isFood": false,
  "rejectionReason": "Clear, user-friendly explanation of why it is not food (e.g. 'This input refers to an electronic device or non-food item, not a meal or beverage. Please enter a food or drink item.')",
  "items": [],
  "total": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
}

If the input IS genuine edible food or drink:
Calculate accurate nutritional values, an evidence-based NutriScore (Healthiness Score), and an actionable "Healthy Swap" recommendation.

NutriScore Guidance:
- Grade A (80-100): High in lean protein, fiber, whole grains, vegetables, healthy fats. Low in added sugar and saturated fat. Label: "Nutrient Dense"
- Grade B (65-79): Balanced meal, moderately nutrient-dense, minimal processing. Label: "Balanced"
- Grade C (50-64): Moderate nutritional value, refined or higher in calories/sodium. Label: "Moderate"
- Grade D (35-49): High in saturated fats, refined carbohydrates, or added sugars. Label: "Calorie Dense"
- Grade E (1-34): Ultra-processed, deep-fried, high sugar/trans fat, empty calories. Label: "Ultra-Processed"

Healthy Swap Tip:
A concise 1-2 sentence recommendation on how to make this meal healthier (e.g., swapping a refined ingredient, adding fiber, or reducing oil/cream).

Return strictly valid JSON:
{
  "isFood": true,
  "rejectionReason": null,
  "healthScore": {
    "score": number (1 to 100),
    "grade": "A" | "B" | "C" | "D" | "E",
    "label": "string"
  },
  "insights": {
    "fiberLevel": "High" | "Moderate" | "Low",
    "processingLevel": "Whole Food" | "Minimally Processed" | "Moderately Processed" | "Ultra-Processed",
    "sugarLevel": "Low" | "Moderate" | "High",
    "healthySwapTip": "string with specific actionable swap suggestion",
    "pros": ["string", "string"],
    "cons": ["string", "string"]
  },
  "items": [
    {
      "name": "food item name",
      "quantity": "estimated portion size (e.g., 2 slices, 1 bowl, 150g)",
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
- Consider Indian foods (roti, paneer, dal, biryani, sabzi, etc.) as well as international cuisines.
- Use realistic portion estimates and averages.
- Do not include markdown code block formatting or explanations, output strictly JSON.

Input: "${userInput}"
`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const cleaned = result.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Gemini Text Analysis Error:", error.message);
    throw new Error(`Food analysis failed: ${error.message}`);
  }
}

export async function analyzeFoodByImage(base64Data, mimeType) {
  try {
    const prompt = `
You are an expert clinical nutritionist and visual food recognition engine.
Inspect the food and beverages in this image.

First, determine if the image actually depicts edible food, ingredients, groceries, meals, snacks, or beverages.
If the image does NOT depict edible food or drinks (e.g., it is a photo of a person, animal/pet, vehicle, shoes/clothing, electronic gadget, documents, furniture, empty plate, non-edible object, or random indoor/outdoor scene):
Return strictly valid JSON:
{
  "isFood": false,
  "rejectionReason": "Clear, user-friendly explanation of what was detected instead of food (e.g., 'No food or drink detected in this image. Detected an electronic device/clothing/room instead. Please upload a clear photo of your meal.')",
  "items": [],
  "total": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
}

If the image DOES depict edible food or drink:
Identify dishes/ingredients, calculate nutritional values, assign an evidence-based NutriScore (Healthiness Score), and provide an actionable "Healthy Swap" tip.

NutriScore Guidance:
- Grade A (80-100): High in lean protein, fiber, whole grains, vegetables, healthy fats. Low in added sugar/saturated fat. Label: "Nutrient Dense"
- Grade B (65-79): Balanced meal, moderately nutrient-dense, minimal processing. Label: "Balanced"
- Grade C (50-64): Moderate nutritional value, refined or higher in calories/sodium. Label: "Moderate"
- Grade D (35-49): High in saturated fats, refined carbohydrates, or added sugars. Label: "Calorie Dense"
- Grade E (1-34): Ultra-processed, deep-fried, high sugar/trans fat, empty calories. Label: "Ultra-Processed"

Healthy Swap Tip:
A concise 1-2 sentence recommendation on how to make this meal healthier (e.g., swapping a refined ingredient, adding fiber, or reducing oil/cream).

Return strictly valid JSON:
{
  "isFood": true,
  "rejectionReason": null,
  "healthScore": {
    "score": number (1 to 100),
    "grade": "A" | "B" | "C" | "D" | "E",
    "label": "string"
  },
  "insights": {
    "fiberLevel": "High" | "Moderate" | "Low",
    "processingLevel": "Whole Food" | "Minimally Processed" | "Moderately Processed" | "Ultra-Processed",
    "sugarLevel": "Low" | "Moderate" | "High",
    "healthySwapTip": "string with specific actionable swap suggestion",
    "pros": ["string", "string"],
    "cons": ["string", "string"]
  },
  "items": [
    {
      "name": "food item name",
      "quantity": "portion size estimate (e.g., 1 plate, 200g, 1 bowl)",
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

Consider Indian cuisine and international dishes, use realistic portion estimates, and output ONLY strictly valid JSON.
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
        responseMimeType: "application/json",
      }
    });

    const cleaned = result.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Gemini Image Analysis Error:", error.message);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}
