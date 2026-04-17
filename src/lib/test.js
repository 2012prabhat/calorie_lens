import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"AIzaSyD9C4zsNHOokKych57DLaDT1I6jKEyobAw"});


async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "What is the capital of France?",
  });
  console.log(response.text);
}

await main();