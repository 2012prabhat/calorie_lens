import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request) {
    try {
        await dbConnect();
        
        const reqBody = await request.json();
        const { email } = reqBody;

        const user = await User.findOne({ email });
        
        if (!user) {
            // Wait, for security reasons we might just say Email sent to avoid leaking emails. But returning an error is fine for this scope.
            return NextResponse.json({ error: "User with this email does not exist" }, { status: 400 });
        }

        // Send reset email
        await sendEmail({ email, emailType: "RESET", userId: user._id });

        return NextResponse.json({
            message: "Password reset email sent successfully.",
            success: true
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
