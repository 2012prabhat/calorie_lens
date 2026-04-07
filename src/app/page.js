import Link from "next/link";
import { Camera, PieChart, Activity, MoveRight, Layers, CheckCircle } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col font-sans selection:bg-emerald-500/30">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/60 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-black">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Calorie Lens</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition hidden md:block">
                            Log In
                        </Link>
                        <Link href="/signup" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-gray-200">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Hero Section */}
                <section className="relative w-full overflow-hidden border-b border-gray-900 pt-24 pb-32">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 opacity-20 bg-gradient-radial from-emerald-500 to-transparent blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 -z-10 h-[40rem] w-[40rem] translate-x-1/3 -translate-y-1/2 opacity-10 bg-gradient-radial from-teal-500 to-transparent blur-3xl"></div>

                    <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            Smart Calorie Tracking is Here
                        </div>
                        
                        <h1 className="max-w-4xl font-extrabold tracking-tight text-5xl md:text-6xl lg:text-7xl mb-8">
                            See Your Food in a
                            <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 leading-normal pb-2"> Whole New Light</span>
                        </h1>
                        
                        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-light">
                            Achieve your fitness goals with Calorie Lens. Simply snap a photo or log your meals to get instant, accurate macro breakdowns and insights.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <Link href="/signup" className="group rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-black transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2">
                                Start Tracking for Free
                                <MoveRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/login" className="rounded-full border border-gray-700 bg-gray-900 px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700">
                                View Your Dashboard
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full py-24 bg-gray-950 relative border-b border-gray-900">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-16 text-center max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to master your nutrition.</h2>
                            <p className="mt-4 text-gray-400 text-lg">Powerful tools packed into a beautiful, seamless experience.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group relative rounded-3xl border border-gray-800 bg-gray-900/50 p-8 transition hover:bg-gray-900 overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-emerald-400 border border-gray-700 shadow-inner">
                                    <Camera size={24} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Smart Photo Analysis</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    Simply upload a picture of your meal. Our advanced AI instantly estimates the calories, proteins, fats, and carbs.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group relative rounded-3xl border border-gray-800 bg-gray-900/50 p-8 transition hover:bg-gray-900 overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl transition group-hover:bg-teal-500/20"></div>
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-teal-400 border border-gray-700 shadow-inner">
                                    <PieChart size={24} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Detailed Macro Breakdown</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    Track exactly what goes into your body to fine-tune your diet for cutting, bulking, or maintenance.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group relative rounded-3xl border border-gray-800 bg-gray-900/50 p-8 transition hover:bg-gray-900 overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-emerald-400 border border-gray-700 shadow-inner">
                                    <Layers size={24} />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Progress Visualizations</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    View beautiful, easy-to-read charts that give you rapid insights into your daily and weekly streaks.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works / CTA split */}
                <section className="w-full py-24 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 translate-y-1/2 opacity-10 bg-gradient-radial from-emerald-600 to-transparent blur-3xl"></div>
                    
                    <div className="mx-auto max-w-7xl px-6 flex flex-col items-center">
                        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-10 md:p-16 text-center w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                            
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ready to transform your habits?</h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                                Join our platform today and experience calorie counting that actually feels effortless. Setup takes less than 60 seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                <Link href="/signup" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-gray-200">
                                    Create Free Account
                                </Link>
                                <span className="text-gray-500 text-sm hidden sm:block">or</span>
                                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium text-base transition">
                                    Sign into existing account &rarr;
                                </Link>
                            </div>
                            
                            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap opacity-50">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle size={16} className="text-emerald-500" /> Secure Encryption
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle size={16} className="text-emerald-500" /> Daily Reminders
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle size={16} className="text-emerald-500" /> Cancel Anytime
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-gray-900 py-10">
                <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Activity size={18} />
                        <span className="font-semibold text-white text-lg">Calorie Lens</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        &copy; {new Date().getFullYear()} Calorie Lens. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-emerald-400 transition">Privacy</a>
                        <a href="#" className="hover:text-emerald-400 transition">Terms</a>
                        <a href="#" className="hover:text-emerald-400 transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
