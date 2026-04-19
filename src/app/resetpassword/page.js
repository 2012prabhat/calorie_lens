"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlToken = queryParams.get("token");
        setToken(urlToken || "");
    }, []);

    const onResetPassword = async (e) => {
        if (e) e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
       
        try {
            setLoading(true);
            await axios.post("/api/auth/resetpassword", { token, password });
            toast.success("Password reset successfully. You can now login.");
            setSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.error || "Error resetting password");
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
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reset Password</h1>
                            <p className="text-sm text-gray-400">Enter your new password below.</p>
                        </div>

                        {!success ? (
                            <form onSubmit={onResetPassword} className="space-y-5">
                                {!token && (
                                    <div className="p-3 bg-yellow-900/40 text-yellow-500 rounded-xl border border-yellow-700/50 text-sm text-center mb-4">
                                        No token found in URL.
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-gray-300">New Password</label>
                                    <input 
                                        className="w-full rounded-xl border border-gray-700 bg-gray-950/50 p-3.5 text-white placeholder-gray-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5 text-gray-300">Confirm Password</label>
                                    <input 
                                        className="w-full rounded-xl border border-gray-700 bg-gray-950/50 p-3.5 text-white placeholder-gray-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="group w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3.5 font-semibold text-black transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || !token || !password || !confirmPassword}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="text-emerald-400" size={48} />
                                </div>
                                <h2 className="text-xl font-semibold text-emerald-400 mb-2">Success!</h2>
                                <p className="text-sm text-gray-400 mb-6">Your password has been changed safely.</p>
                                <Link 
                                    href="/login" 
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-xl font-medium transition hover:opacity-90 w-full"
                                >
                                    Go to Login
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
