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

        // Fetch all raw logs for the user to show a full graph
        const allLogs = await Weight.find({
            userId: user.id
        }).sort({ date: 1 });

        // Calculate Monthly Comparisons
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthLogs = allLogs.filter(log => {
            const d = new Date(log.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const prevMonthLogs = allLogs.filter(log => {
            const d = new Date(log.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const calculateChange = (logs) => {
            const valid = logs.filter(l => l.weight !== undefined && l.weight !== null);
            if (valid.length < 2) return 0;
            const start = valid[0].weight;
            const end = valid[valid.length - 1].weight;
            return parseFloat((end - start).toFixed(1));
        };

        const currentMonthChange = calculateChange(currentMonthLogs);
        const prevMonthChange = calculateChange(prevMonthLogs);

        // Map logs for graph and metrics history
        const historyArray = allLogs.map(log => ({
            _id: log._id,
            date: log.date.toISOString().split('T')[0],
            displayDate: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: log.weight ?? null,
            chest: log.chest ?? null,
            waist: log.waist ?? null,
            stomach: log.stomach ?? null,
            unit: log.unit || "in"
        }));

        const latestEntry = historyArray.length > 0 ? historyArray[historyArray.length - 1] : null;

        return NextResponse.json({ 
            history: historyArray,
            latest: latestEntry,
            monthlyStats: {
                currentMonth: {
                    change: currentMonthChange,
                    logsCount: currentMonthLogs.length,
                    monthName: now.toLocaleString('default', { month: 'long' })
                },
                prevMonth: {
                    change: prevMonthChange,
                    logsCount: prevMonthLogs.length,
                    monthName: new Date(prevMonthYear, prevMonth, 1).toLocaleString('default', { month: 'long' })
                }
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Weight History Error:", error);
        return NextResponse.json({ error: "Failed to fetch weight history" }, { status: 500 });
    }
}
