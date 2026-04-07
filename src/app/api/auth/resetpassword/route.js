import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request) {
    try {
        await dbConnect();
        
        const reqBody = await request.json();
        const { token, password } = reqBody;

        const user = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: { $gt: Date.now() } // token must be valid
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Hash new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Update user
        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        
        await user.save();

        return NextResponse.json({
            message: "Password reset successfully",
            success: true
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
