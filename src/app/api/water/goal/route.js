import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WaterLog from "@/models/WaterLog";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dailyGoal, date: clientDate } = await req.json();
    if (!dailyGoal || dailyGoal < 500 || dailyGoal > 10000) {
      return NextResponse.json({ error: "Please provide a valid goal between 500ml and 10,000ml" }, { status: 400 });
    }

    const date = clientDate || new Date().toISOString().split("T")[0];

    let waterLog = await WaterLog.findOne({ userId: user.id, date });

    if (!waterLog) {
      waterLog = new WaterLog({
        userId: user.id,
        date,
        totalAmount: 0,
        dailyGoal,
        entries: [],
      });
    } else {
      waterLog.dailyGoal = dailyGoal;
    }

    await waterLog.save();

    return NextResponse.json({
      success: true,
      message: "Daily water goal updated",
      data: waterLog,
    });
  } catch (err) {
    console.error("Water Goal PUT Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update water goal" }, { status: 500 });
  }
}
