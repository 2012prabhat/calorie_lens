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
            subject: emailType === "VERIFY" ? "Verify your email for Calorie Lens" : "Reset your password for Calorie Lens",
            html: `
                <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #10b981; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Calorie Lens</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Smart Nutrition Tracking</p>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #f3f4f6;">
                        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; text-align: center;">
                            ${emailType === "VERIFY" ? "Verify Your Account" : "Reset Your Password"}
                        </h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
                            ${emailType === "VERIFY" 
                                ? "Welcome to Calorie Lens! We're excited to have you. Please verify your email address to get started with your nutrition tracking journey." 
                                : "We received a request to reset your password. If you didn't make this request, you can safely ignore this email."}
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="${link}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                                ${emailType === "VERIFY" ? "Verify Email Address" : "Reset Password"}
                            </a>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 13px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                        <p style="margin: 0;"><a href="${link}" style="color: #10b981; font-size: 13px; word-break: break-all;">${link}</a></p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">This link will securely expire in 1 hour.</p>
                    </div>
                </div>
            `
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

    } catch (error) {
        throw new Error(error.message);
    }
}
