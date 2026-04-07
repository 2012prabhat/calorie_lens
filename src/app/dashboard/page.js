"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
    Activity, LogOut, Plus, Flame, Beef, Droplets, Wheat,
    TrendingUp, Clock, ChevronRight, Camera, Search,
    BarChart2, Calendar, User, X, Utensils
} from "lucide-react";

// --- Mock Data ---
const weeklyData = [
    { day: "Mon", calories: 1850, goal: 2000 },
    { day: "Tue", calories: 2100, goal: 2000 },
    { day: "Wed", calories: 1600, goal: 2000 },
    { day: "Thu", calories: 1950, goal: 2000 },
    { day: "Fri", calories: 2200, goal: 2000 },
    { day: "Sat", calories: 1400, goal: 2000 },
    { day: "Sun", calories: 1720, goal: 2000 },
];

const recentMeals = [
    { id: 1, name: "Avocado Toast with Egg", time: "8:30 AM", calories: 420, protein: 18, carbs: 38, fat: 22, emoji: "🥑", meal: "Breakfast" },
    { id: 2, name: "Grilled Chicken Salad", time: "12:45 PM", calories: 520, protein: 45, carbs: 22, fat: 18, emoji: "🥗", meal: "Lunch" },
    { id: 3, name: "Protein Shake", time: "3:00 PM", calories: 180, protein: 30, carbs: 10, fat: 4, emoji: "🥤", meal: "Snack" },
    { id: 4, name: "Greek Yogurt with Berries", time: "5:30 PM", calories: 220, protein: 15, carbs: 28, fat: 6, emoji: "🫐", meal: "Snack" },
];

const todayStats = {
    caloriesConsumed: 1340,
    caloriesGoal: 2000,
    protein: { consumed: 108, goal: 150 },
    carbs: { consumed: 98, goal: 250 },
    fat: { consumed: 50, goal: 65 },
};

// --- Sub-Components ---
function CircularProgress({ percentage, size = 120, strokeWidth = 10, color = "#10b981" }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-gray-800" fill="none" />
            <circle
                cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none"
                stroke={color} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}

function MacroBar({ label, consumed, goal, color, icon: Icon }) {
    const pct = Math.min((consumed / goal) * 100, 100);
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                    <Icon size={14} className={color} /> {label}
                </span>
                <span className="text-gray-400">{consumed}g <span className="text-gray-600">/ {goal}g</span></span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color.replace("text-", "bg-")}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function WeeklyBar({ day, calories, goal, isToday }) {
    const maxCalories = 2500;
    const heightPct = (calories / maxCalories) * 100;
    const goalPct = (goal / maxCalories) * 100;
    const isOver = calories > goal;
    return (
        <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs text-gray-400">{calories >= 1000 ? `${(calories / 1000).toFixed(1)}k` : calories}</span>
            <div className="relative w-full flex justify-center" style={{ height: "120px" }}>
                {/* Goal line */}
                <div className="absolute w-full border-t border-dashed border-gray-700" style={{ top: `${100 - goalPct}%` }} />
                {/* Bar */}
                <div className="w-full max-w-[28px] rounded-full self-end overflow-hidden" style={{ height: `${heightPct}%` }}>
                    <div className={`w-full h-full rounded-full ${isToday ? "bg-gradient-to-t from-emerald-600 to-teal-400" : isOver ? "bg-gray-700" : "bg-gray-700"} ${isToday ? "opacity-100" : "opacity-60 hover:opacity-80 transition"}`} />
                </div>
            </div>
            <span className={`text-xs font-medium ${isToday ? "text-emerald-400" : "text-gray-500"}`}>{day}</span>
        </div>
    );
}

// --- Main Dashboard ---
export default function DashboardPage() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [showLogMeal, setShowLogMeal] = useState(false);

    useEffect(() => {
        axios.get("/api/auth/me")
            .then(res => setUserData(res.data.data))
            .catch(() => router.push("/login"));
    }, []);

    const logout = async () => {
        await axios.get("/api/auth/logout");
        toast.success("Logged out");
        router.push("/login");
    };

    const caloriesPct = (todayStats.caloriesConsumed / todayStats.caloriesGoal) * 100;
    const caloriesLeft = todayStats.caloriesGoal - todayStats.caloriesConsumed;

    const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post("/api/analyze", formData);
        console.log(res.data);

        toast.success("Food analyzed!");

        // 👉 Save result to state (later DB)
    } catch (err) {
        toast.error("Failed to analyze image");
    }
};
    return (
        <div className="min-h-screen bg-gray-950 text-gray-50 font-sans">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-black transition-transform group-hover:scale-105">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white hidden sm:block">Calorie Lens</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800/80 text-white">Dashboard</Link>
                        <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition">History</button>
                        <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition">Settings</button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold text-xs">
                                {userData?.name?.[0]?.toUpperCase() || <User size={14} />}
                            </div>
                            <span className="hidden sm:block font-medium">{userData?.name || "..."}</span>
                        </div>
                        <button onClick={logout} className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
                            <LogOut size={14} />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
                {/* Welcome Banner */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {userData?.name?.split(" ")[0] || "there"} 👋
                        </h1>
                        <p className="text-gray-400 mt-1">Here's a snapshot of your nutrition for today.</p>
                    </div>
                    <button
                        onClick={() => setShowLogMeal(true)}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-black transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] self-start"
                    >
                        <Plus size={16} />
                        Log a Meal
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: today's ring + macros */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Calorie Ring Card */}
                        <div className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur p-6 flex flex-col items-center gap-4">
                            <div className="flex items-center justify-between w-full">
                                <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2"><Flame size={16} className="text-emerald-400" /> Today's Calories</h2>
                                <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} /> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                            </div>
                            <div className="relative flex items-center justify-center">
                                <CircularProgress percentage={caloriesPct} size={160} strokeWidth={12} color="#10b981" />
                                <div className="absolute text-center">
                                    <p className="text-3xl font-bold text-white">{todayStats.caloriesConsumed}</p>
                                    <p className="text-xs text-gray-500">consumed</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 w-full text-center text-sm gap-2">
                                <div className="rounded-xl bg-gray-800/60 p-2">
                                    <p className="font-semibold text-white">{todayStats.caloriesGoal}</p>
                                    <p className="text-gray-500 text-xs">Goal</p>
                                </div>
                                <div className="rounded-xl bg-gray-800/60 p-2">
                                    <p className="font-semibold text-emerald-400">{caloriesLeft > 0 ? caloriesLeft : 0}</p>
                                    <p className="text-gray-500 text-xs">Remaining</p>
                                </div>
                                <div className="rounded-xl bg-gray-800/60 p-2">
                                    <p className="font-semibold text-orange-400">0</p>
                                    <p className="text-gray-500 text-xs">Burned</p>
                                </div>
                            </div>
                        </div>

                        {/* Macros Card */}
                        <div className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur p-6 flex flex-col gap-5">
                            <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2"><BarChart2 size={16} className="text-teal-400" /> Macronutrients</h2>
                            <MacroBar label="Protein" consumed={todayStats.protein.consumed} goal={todayStats.protein.goal} color="text-blue-400" icon={Beef} />
                            <MacroBar label="Carbs" consumed={todayStats.carbs.consumed} goal={todayStats.carbs.goal} color="text-orange-400" icon={Wheat} />
                            <MacroBar label="Fats" consumed={todayStats.fat.consumed} goal={todayStats.fat.goal} color="text-pink-400" icon={Droplets} />
                        </div>
                    </div>

                    {/* Right Col: weekly chart + meals */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Weekly Chart Card */}
                        <div className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" /> Weekly Overview</h2>
                                <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-3 py-1">Last 7 Days</span>
                            </div>
                            <div className="flex items-end gap-2 md:gap-3">
                                {weeklyData.map((d, i) => (
                                    <WeeklyBar key={d.day} {...d} isToday={i === 6} />
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 inline-block" /> Today</span>
                                <span className="flex items-center gap-1.5"><span className="h-1 w-4 border-t border-dashed border-gray-500 inline-block" /> Daily Goal</span>
                            </div>
                        </div>

                        {/* Today's Meals Card */}
                        <div className="rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2"><Utensils size={16} className="text-teal-400" /> Today's Meals</h2>
                                <button className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                                    View All <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="flex flex-col divide-y divide-gray-800/60">
                                {recentMeals.map((meal) => (
                                    <div key={meal.id} className="flex items-center gap-4 py-3.5 group">
                                        <div className="text-2xl w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">{meal.emoji}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{meal.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {meal.time} · {meal.meal}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-white">{meal.calories} kcal</p>
                                            <p className="text-xs text-gray-500">P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Log Meal Modal */}
            {showLogMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-3xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Log a Meal</h3>
                            <button onClick={() => setShowLogMeal(false)} className="text-gray-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="fileInput"
                            />

                            <label htmlFor="fileInput" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-700 bg-gray-800 p-5 hover:border-emerald-500/50 hover:bg-gray-700 transition group">
                                    <Camera size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-300">Snap a Photo</span>
                                </div>
                            </label>

                            <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-700 bg-gray-800 p-5 hover:border-teal-500/50 hover:bg-gray-700 transition group">
                                <Search size={24} className="text-teal-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-gray-300">Search Food</span>
                            </button>

                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search for a food item..."
                                className="w-full rounded-xl border border-gray-700 bg-gray-950 pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <p className="text-xs text-gray-600 text-center mt-4">Food search & photo AI coming soon</p>
                    </div>
                </div>
            )}
        </div>
    );
}
