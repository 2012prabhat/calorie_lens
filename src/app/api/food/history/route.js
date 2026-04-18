import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import Plan from "@/models/Plan";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const daysPerPage = 7;

        // Calculate the date range
        // page=1: 0 to 6 days ago (today included)
        // page=2: 7 to 13 days ago
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - ((page - 1) * daysPerPage));
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (daysPerPage - 1));
        startDate.setHours(0, 0, 0, 0);

        const logs = await FoodLog.find({
            userId: user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        const myPlan = await Plan.findOne({ userId: user.id });
        const goalCalories = myPlan?.targetCalories || 2000;

        // Group by day
        const historyMap = {};
        
        // Initialize the 7 days with 0
        for (let i = daysPerPage - 1; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            historyMap[dateStr] = {
                date: dateStr,
                displayDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                shortDate: d.toLocaleDateString('en-US', { weekday: 'short' }),
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                items: []
            };
        }

        // Populate with actual data
        logs.forEach(log => {
            const logDate = new Date(log.date);
            const dateStr = logDate.toISOString().split('T')[0];
            if (historyMap[dateStr]) {
                historyMap[dateStr].calories += log.total?.calories || 0;
                historyMap[dateStr].protein += log.total?.protein || 0;
                historyMap[dateStr].carbs += log.total?.carbs || 0;
                historyMap[dateStr].fat += log.total?.fat || 0;
                if (log.items) {
                    historyMap[dateStr].items.push(...log.items);
                }
            }
        });

        const historyArray = Object.values(historyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        return NextResponse.json({ 
            history: historyArray,
            goalCalories
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch History Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}