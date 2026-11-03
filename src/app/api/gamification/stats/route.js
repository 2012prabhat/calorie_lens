import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getUserFromToken } from "@/lib/auth";
import { computeGamificationStats } from "@/lib/gamification";

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timezoneOffset = Number(searchParams.get("offset") || 0);

    const stats = await computeGamificationStats(user.id, timezoneOffset);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("Gamification GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to load achievements" }, { status: 500 });
  }
}
