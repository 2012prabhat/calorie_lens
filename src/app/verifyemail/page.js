"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const verifyUserEmail = async () => {
        try {
            setLoading(true);
            await axios.post('/api/auth/verifyemail', { token });
            setVerified(true);
            toast.success("Email verified successfully");
        } catch (error) {
            setError(true);
            toast.error(error.response?.data?.error || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlToken = queryParams.get("token");
        setToken(urlToken || "");
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="p-8 border border-gray-700 rounded-xl bg-gray-800 shadow-2xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-6">Verify Email</h1>
                
                <h2 className="p-2 bg-gray-700 rounded-lg text-sm break-all text-gray-300 mb-6">
                    {token ? `${token.substring(0, 20)}...` : "no token found"}
                </h2>

                {token && !verified && !error && (
                    <button 
                        onClick={verifyUserEmail}
                        disabled={loading}
                        className="w-full mt-4 p-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Click to Verify"}
                    </button>
                )}

                {verified && (
                    <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
                        <h2 className="text-xl font-semibold text-green-400 mb-4">Email Verified!</h2>
                        <Link href="/login" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition">
                            Login Now
                        </Link>
                    </div>
                )}
                
                {error && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                        <h2 className="text-xl font-semibold text-red-400">Error</h2>
                        <p className="text-sm text-red-300 mt-2">Invalid or expired token. Please try signing up again or requesting a new verification email.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
