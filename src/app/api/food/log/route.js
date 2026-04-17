import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import { analyzeFoodFromText } from "@/lib/gemini";
import { getUserFromToken } from "@/lib/auth"; 

export async function POST(req) {
  try {
    await dbConnect();
    // 🔐 Get user
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📥 Get input
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    // 🤖 Gemini AI
    const aiData = await analyzeFoodFromText(userInput);

    if (!aiData || !aiData.total) {
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    // 💾 Save to DB
    const newLog = await FoodLog.create({
      userId: user.id,
      text: userInput,
      items: aiData.items,
      total: aiData.total,
      date: new Date(),
    });

    // ✅ Response
    return NextResponse.json({
      message: "Food logged successfully",
      data: newLog,
    });

  } catch (error) {
    console.error("Food Log Error:", error);
    return NextResponse.json(
      { error: "Error logging food" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    // 🔐 Get user
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Get only this user's logs
    const allLogs = await FoodLog.find({ userId: user.id })
      .sort({ createdAt: -1 });
      console.log("allLogs",allLogs);

    return NextResponse.json(
      { data: allLogs },
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch Logs Error:", error);

    return NextResponse.json(
      { error: "Error fetching food data" },
      { status: 500 }
    );
  }
}