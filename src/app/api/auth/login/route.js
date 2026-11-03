import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkSubscriptionStatus } from "@/lib/subscription";

export async function POST(request) {
    try {
        await dbConnect();

        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        // Ensure email is verified
        if (!user.isVerified) {
            return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
        }

        // Ensure subscription status is up to date (check expiry etc.)
        const { user: updatedUser } = await checkSubscriptionStatus(user._id);
        const activeUser = updatedUser || user;

        // Create token data
        const tokenData = {
            id: activeUser._id,
            name: activeUser.name,
            email: activeUser.email
        };

        const tokenSecret = process.env.JWT_SECRET || "fallback_secret_key_for_development";

        // Create token
        const token = await jwt.sign(tokenData, tokenSecret, { expiresIn: "30d" });

        // Build clean user payload with subscription data
        const userData = {
            _id: activeUser._id,
            name: activeUser.name,
            email: activeUser.email,
            isVerified: activeUser.isVerified,
            subscriptionStatus: activeUser.subscriptionStatus,
            subscriptionEndDate: activeUser.subscriptionEndDate,
            trialEndDate: activeUser.trialEndDate,
            hasUsedTrial: activeUser.hasUsedTrial,
            createdAt: activeUser.createdAt
        };

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            token,
            user: userData,
            name: activeUser.name,
            email: activeUser.email
        });

        // Set HttpOnly cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
