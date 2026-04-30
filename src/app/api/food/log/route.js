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
      userId: user.id,
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