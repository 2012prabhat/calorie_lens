import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkSubscriptionStatus } from "@/lib/subscription";
import dbConnect from "@/lib/dbConnect.js";

export async function GET(request) {
    try {
        await dbConnect();
        const decoded = await getUserFromToken(request);
        const userId = decoded?.id;
        if (!userId) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { user } = await checkSubscriptionStatus(userId);
        
        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEndDate: user.subscriptionEndDate,
            trialEndDate: user.trialEndDate,
            hasUsedTrial: user.hasUsedTrial,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            message: "User found",
            data: safeUser
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
