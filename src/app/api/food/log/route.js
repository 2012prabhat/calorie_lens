import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import { analyzeFoodFromText } from "@/lib/gemini";
import { getUserFromToken } from "@/lib/auth"; 
import { checkSubscriptionStatus } from "@/lib/subscription";

export async function POST(req) {
  try {
    await dbConnect();
    // 🔐 Get user
    const decoded = await getUserFromToken(req);
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 💳 Check subscription
    const { isActive } = await checkSubscriptionStatus(decoded.id);
    if (!isActive) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    // 📥 Get input
    const { userInput, aiData: providedAiData, analyzeOnly } = await req.json();

    let aiData = providedAiData;
    let text = userInput;

    if (!aiData) {
      if (!userInput) {
        return NextResponse.json(
          { error: "Input is required" },
          { status: 400 }
        );
      }
      // 🤖 Gemini AI (Text analysis)
      aiData = await analyzeFoodFromText(userInput);
    } else {
      // If aiData is provided (from image), and text is empty, set a default
      if (!text) {
        text = `Image analysis: ${aiData.items.map(i => i.name).join(', ')}`;
      }
    }

    if (!aiData || !aiData.total) {
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    // If only analysis is requested, return early
    if (analyzeOnly) {
      return NextResponse.json({
        message: "Analysis complete",
        data: aiData,
      });
    }

    // Strip _id from items to prevent duplicate keys when logging saved meals
    const itemsWithoutId = aiData.items.map(item => {
      const { _id, ...rest } = item;
      return rest;
    });

    // 💾 Save to DB
    const newLog = await FoodLog.create({
      userId: decoded.id,
      text: text,
      items: itemsWithoutId,
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
    const decoded = await getUserFromToken(req);

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 💳 Check subscription (Optional: maybe let them see history but not log?)
    // Actually, usually history is premium too if logging is. 
    // But let's allow GET for now or restrict it.
    // The user said they can still "log", so POST is the main concern.
    // However, if we want to be consistent:
    const { isActive } = await checkSubscriptionStatus(decoded.id);
    if (!isActive) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    // ✅ Get only this user's logs
    const allLogs = await FoodLog.find({ userId: decoded.id })
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