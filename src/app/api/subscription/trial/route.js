import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect.js";
import { getUserFromToken } from "@/lib/auth";

dbConnect();

export async function POST(request) {
    try {
        const decoded = await getUserFromToken(request);
        const userId = decoded?.id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.hasUsedTrial) {
            return NextResponse.json({ error: "Trial has already been used" }, { status: 400 });
        }

        // Set trial for 7 days
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        user.subscriptionStatus = 'trialing';
        user.trialEndDate = trialEndDate;
        user.hasUsedTrial = true;
        
        await user.save();

        return NextResponse.json({
            message: "Trial activated successfully",
            success: true,
            trialEndDate
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
