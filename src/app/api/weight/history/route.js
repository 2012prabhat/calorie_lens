import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Weight from "@/models/Weight";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
    try {
        await dbConnect();
        const user = await getUserFromToken(req);

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const view = url.searchParams.get("view") || "daily";
        const page = parseInt(url.searchParams.get("page") || "1");

        if (view === "weekly") {
            // Weekly view - Last 12 weeks
            const weeksToFetch = 12;
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);

            // Go back 12 weeks
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - (weeksToFetch * 7));
            startDate.setHours(0, 0, 0, 0);

            const logs = await Weight.find({
                userId: user.id,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            const weeklyHistory = [];
            
            for (let i = weeksToFetch - 1; i >= 0; i--) {
                const wEnd = new Date(endDate);
                wEnd.setDate(wEnd.getDate() - (i * 7));
                const wStart = new Date(wEnd);
                wStart.setDate(wStart.getDate() - 6);
                wStart.setHours(0, 0, 0, 0);

                const weekLogs = logs.filter(log => {
                    const d = new Date(log.date);
                    return d >= wStart && d <= wEnd;
                });

                let avgWeight = null;
                if (weekLogs.length > 0) {
                    const sum = weekLogs.reduce((acc, log) => acc + log.weight, 0);
                    avgWeight = parseFloat((sum / weekLogs.length).toFixed(1));
                }

                const dateRangeStr = `${wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${wEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                weeklyHistory.push({
                    date: wStart.toISOString().split('T')[0],
                    displayDate: dateRangeStr,
                    shortDate: `W${weeksToFetch - i}`,
                    weight: avgWeight
                });
            }

            return NextResponse.json({ 
                history: weeklyHistory 
            }, { status: 200 });
        }

        // Default Daily View (existing behavior)
        const daysPerPage = 7;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - ((page - 1) * daysPerPage));
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - (daysPerPage - 1));
        startDate.setHours(0, 0, 0, 0);

        const logs = await Weight.find({
            userId: user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        const historyMap = {};
        for (let i = daysPerPage - 1; i >= 0; i--) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            historyMap[dateStr] = {
                date: dateStr,
                displayDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                shortDate: d.toLocaleDateString('en-US', { weekday: 'short' }),
                weight: null
            };
        }

        logs.forEach(log => {
            const logDate = new Date(log.date);
            const dateStr = logDate.toISOString().split('T')[0];
            if (historyMap[dateStr]) {
                historyMap[dateStr].weight = log.weight;
            }
        });

        const historyArray = Object.values(historyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        return NextResponse.json({ 
            history: historyArray 
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Weight History Error:", error);
        return NextResponse.json({ error: "Failed to fetch weight history" }, { status: 500 });
    }
}
