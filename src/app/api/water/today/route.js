import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WaterLog from "@/models/WaterLog";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    // Client date format YYYY-MM-DD or server today
    const date = dateParam || new Date().toISOString().split("T")[0];

    let waterLog = await WaterLog.findOne({ userId: user.id, date });

    if (!waterLog) {
      // Find the most recent goal setting
      const previousLog = await WaterLog.findOne({ userId: user.id }).sort({ createdAt: -1 });
      const dailyGoal = previousLog?.dailyGoal || 2500;

      waterLog = await WaterLog.create({
        userId: user.id,
        date,
        totalAmount: 0,
        dailyGoal,
        entries: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: waterLog,
    });
  } catch (err) {
    console.error("Water GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch water data" }, { status: 500 });
  }
}
