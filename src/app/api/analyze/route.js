import { analyzeFood } from "@/lib/gemini";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return Response.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Convert file → base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        // Call Gemini
        const result = await analyzeFood(base64Image);

        return Response.json(result);

    } catch (error) {
        console.error("API Error:", error);

        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}