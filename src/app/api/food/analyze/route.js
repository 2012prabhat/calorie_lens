import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import { analyzeFoodByImage } from "@/lib/gemini";
import { getUserFromToken } from "@/lib/auth";
import { checkSubscriptionStatus } from "@/lib/subscription";

export async function POST(req) {
    try {
        await dbConnect();
        // 🔐 Get user
        const decoded = await getUserFromToken(req);
        if (!decoded) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 💳 Check subscription
        const { isActive } = await checkSubscriptionStatus(decoded.id);
        if (!isActive) {
            return NextResponse.json(
                { error: "Premium subscription required" },
                { status: 403 }
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