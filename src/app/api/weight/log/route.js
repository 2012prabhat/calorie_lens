import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Weight from "@/models/Weight";
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
    const { weight } = await req.json();

    if (!weight) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

 

    // 💾 Save to DB
    const newLog = await Weight.create({
      userId: user.id,
      weight: weight,
      date: new Date(),
    });

    // ✅ Response
    return NextResponse.json({
      message: "Weight logged successfully",
      data: newLog,
    });

  } catch (error) {
    console.error("Weight Log Error:", error);
    return NextResponse.json(
      { error: "Error logging weight" },
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
    const allLogs = await Weight.find({ userId: user.id })
      .sort({ createdAt: -1 });


    return NextResponse.json(
      { data: allLogs },
      { status: 200 }
    );

  } catch (error) {
    console.error("Fetch Logs Error:", error);

    return NextResponse.json(
      { error: "Error fetching weight data" },
      { status: 500 }
    );
  }
}