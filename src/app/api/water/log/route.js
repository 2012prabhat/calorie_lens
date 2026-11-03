import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WaterLog from "@/models/WaterLog";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, date: clientDate, reset } = await req.json();
    const date = clientDate || new Date().toISOString().split("T")[0];

    let waterLog = await WaterLog.findOne({ userId: user.id, date });

    if (!waterLog) {
      const previousLog = await WaterLog.findOne({ userId: user.id }).sort({ createdAt: -1 });
      const dailyGoal = previousLog?.dailyGoal || 2500;

      waterLog = new WaterLog({
        userId: user.id,
        date,
        totalAmount: 0,
        dailyGoal,
        entries: [],
      });
    }

    if (reset) {
      waterLog.totalAmount = 0;
      waterLog.entries = [];
    } else if (typeof amount === "number") {
      if (amount > 0) {
        waterLog.totalAmount += amount;
        waterLog.entries.push({ amount, timestamp: new Date() });
      } else if (amount < 0) {
        // Undo / decrease
        waterLog.totalAmount = Math.max(0, waterLog.totalAmount + amount);
        if (waterLog.entries.length > 0) {
          waterLog.entries.pop();
        }
      }
    }

    await waterLog.save();

    return NextResponse.json({
      success: true,
      message: "Water logged successfully",
      data: waterLog,
    });
  } catch (err) {
    console.error("Water POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to log water" }, { status: 500 });
  }
}
