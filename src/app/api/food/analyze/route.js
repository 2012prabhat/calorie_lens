import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import { analyzeFoodByImage } from "@/lib/gemini";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req) {
    try {
        await dbConnect();
        // 🔐 Get user
        const user = await getUserFromToken(req);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const formData = await req.formData();
        const file = formData.get('file');

        // Convert File to ArrayBuffer for Gemini
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');

        // Now pass base64Data to your analyzeFoodByImage function
        const result = await analyzeFoodByImage(base64Data, file.type);
        return Response.json(result);

    } catch (err) {
        console.error("Food Log Error:", err);
        return NextResponse.json(
            { error: "Error logging food" },
            { status: 500 }
        );
    }

}