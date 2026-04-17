"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    const onResetPassword = async () => {
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
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="p-8 border border-gray-700 rounded-xl bg-gray-800 shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>
                
                <hr className="border-gray-700 mb-6" />

                {!success ? (
                    <div className="space-y-4">
                        {!token && (
                            <div className="p-3 bg-yellow-900/40 text-yellow-500 rounded border border-yellow-700/50 text-sm text-center mb-4">
                                No token found in URL.
                            </div>
                        )}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">New Password</label>
                            <input 
                                className="p-3 w-full bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
                            <input 
                                className="p-3 w-full bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            onClick={onResetPassword}
                            className="w-full mt-8 p-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !token || !password || !confirmPassword}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg mb-6">
                            <h2 className="text-xl font-semibold text-green-400">Success!</h2>
                            <p className="text-sm text-green-300 mt-2">Your password has been changed safely.</p>
                        </div>
                        <Link href="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition inline-block">
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
