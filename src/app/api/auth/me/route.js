import { getUserFromToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { checkSubscriptionStatus } from "@/lib/subscription";
import dbConnect from "@/lib/dbConnect.js";

export async function GET(request) {
    try {
        const decoded = await getUserFromToken(request);
        const userId = decoded?.id;
        if (!userId) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { user } = await checkSubscriptionStatus(userId);
        
        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "User found",
            data: user
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
