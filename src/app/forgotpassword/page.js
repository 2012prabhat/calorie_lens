"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const onForgotPassword = async () => {
        try {
            setLoading(true);
            await axios.post("/api/auth/forgotpassword", { email });
            toast.success("If that email exists, a reset link has been sent.");
            setEmailSent(true);
        } catch (error) {
            toast.error(error.response?.data?.error || "Error sending email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="p-8 border border-gray-700 rounded-xl bg-gray-800 shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Forgot Password</h1>
                <p className="text-gray-400 text-center text-sm mb-6">Enter your email and we'll send you a link to reset your password.</p>
                
                <hr className="border-gray-700 mb-6" />

                {!emailSent ? (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                            <input 
                                className="p-3 w-full bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>

                        <button
                            onClick={onForgotPassword}
                            className="w-full mt-8 p-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !email}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <p className="text-green-400 text-lg mb-2">Reset link sent!</p>
                        <p className="text-sm text-gray-300">Check your email for the password reset link.</p>
                    </div>
                )}

                <div className="mt-6 text-center text-gray-400">
                    <p>Remember your password? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link></p>
                </div>
            </div>
        </div>
    );
}
