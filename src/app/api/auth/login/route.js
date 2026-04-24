import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

        // Create token data
        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        const tokenSecret = process.env.JWT_SECRET || "fallback_secret_key_for_development";

        // Create token
        const token = await jwt.sign(tokenData, tokenSecret, { expiresIn: "30d" });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            token,
            name: user.name,
            email: user.email
        });

        // Set HttpOnly cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 days
            // secure: process.env.NODE_ENV === "production" // optional but good practice
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
