import nodemailer from 'nodemailer';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';

export const sendEmail = async ({ email, emailType, userId }) => {
    try {
        // Create a hashed token based on the user ID
        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, 
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 } // 1 hour expiry
            );
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, 
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 }
            );
        }

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Use the DOMAIN env variable or default to localhost:3600
        const domain = process.env.DOMAIN || 'http://localhost:3600';

        const link = `${domain}/${emailType === "VERIFY" ? "verifyemail" : "resetpassword"}?token=${encodeURIComponent(hashedToken)}`;

        const mailOptions = {
            from: `"Calorie Lens" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>${emailType === "VERIFY" ? "Verify Your Calorie Lens Account" : "Reset Your Calorie Lens Password"}</h2>
                    <p>Click the link below to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}.</p>
                    <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 15px 0;">
                        ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
                    </a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${link}">${link}</a></p>
                    <p>This link will expire in 1 hour.</p>
                </div>
            `
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

    } catch (error) {
        throw new Error(error.message);
    }
}
