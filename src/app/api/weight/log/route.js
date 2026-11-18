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

    // 📥 Get input (Weight, Chest, Waist, Stomach, Date)
    const { weight, chest, waist, stomach, unit = "in", date } = await req.json();

    const numWeight = weight !== undefined && weight !== "" && !isNaN(weight) ? parseFloat(weight) : undefined;
    const numChest = chest !== undefined && chest !== "" && !isNaN(chest) ? parseFloat(chest) : undefined;
    const numWaist = waist !== undefined && waist !== "" && !isNaN(waist) ? parseFloat(waist) : undefined;
    const numStomach = stomach !== undefined && stomach !== "" && !isNaN(stomach) ? parseFloat(stomach) : undefined;

    if (numWeight === undefined && numChest === undefined && numWaist === undefined && numStomach === undefined) {
      return NextResponse.json(
        { error: "At least one measurement (Weight, Chest, Waist, or Stomach) is required" },
        { status: 400 }
      );
    }

    const logDate = date ? new Date(date) : new Date();

    // 💾 Save to DB
    const newLog = await Weight.create({
      userId: user.id,
      weight: numWeight,
      chest: numChest,
      waist: numWaist,
      stomach: numStomach,
      unit: unit || "in",
      date: isNaN(logDate.getTime()) ? new Date() : logDate,
    });

    // ✅ Response
    return NextResponse.json({
      message: "Body measurements logged successfully",
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