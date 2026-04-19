"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Activity, ArrowRight, Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const onForgotPassword = async (e) => {
        if (e) e.preventDefault();
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
        <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col font-sans selection:bg-emerald-500/30">
            {/* Minimal Navbar for Auth Pages */}
            <header className="absolute top-0 w-full p-6 flex justify-center md:justify-start">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-black transition-transform group-hover:scale-105">
                        <Activity size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white hidden md:block group-hover:text-emerald-400 transition-colors">Calorie Lens</span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 opacity-20 bg-gradient-radial from-emerald-600 to-transparent blur-[100px]"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Forgot Password</h1>
                            <p className="text-sm text-gray-400">Enter your email and we'll send you a reset link.</p>
                        </div>

                        {!emailSent ? (
                            <form onSubmit={onForgotPassword} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-300">Email Address</label>
                                    <input 
                                        className="w-full rounded-xl border border-gray-700 bg-gray-950/50 p-3.5 text-white placeholder-gray-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3.5 font-semibold text-black transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || !email}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Reset Link
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <div className="flex justify-center mb-4">
                                    <MailCheck className="text-emerald-400" size={48} />
                                </div>
                                <p className="text-emerald-400 font-semibold text-lg mb-2">Reset link sent!</p>
                                <p className="text-sm text-gray-400">Check your email for the password reset link.</p>
                            </div>
                        )}

                        <div className="mt-8 text-center text-sm text-gray-400">
                            Remember your password?{' '}
                            <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                Log in here
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
