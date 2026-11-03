import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
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

        if (!file) {
            return NextResponse.json(
                { error: "Image file is required" },
                { status: 400 }
            );
        }

        // Convert File to ArrayBuffer for Gemini
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');

        // Pass base64Data to analyzeFoodByImage function
        const result = await analyzeFoodByImage(base64Data, file.type);

        // Check if image does not contain food/drink
        if (result && result.isFood === false) {
            return NextResponse.json(
                {
                    error: result.rejectionReason || "Wrong meal image: No food or beverage detected in this photo. Please upload a clear picture of your meal.",
                    isFood: false,
                    items: [],
                    total: { calories: 0, protein: 0, carbs: 0, fat: 0 }
                },
                { status: 422 }
            );
        }

        return NextResponse.json(result);

    } catch (err) {
        console.error("Food Analysis Error:", err);
        return NextResponse.json(
            { error: err.message || "Error analyzing food image" },
            { status: 500 }
        );
    }
}
