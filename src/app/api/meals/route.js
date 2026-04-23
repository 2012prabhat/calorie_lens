import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedMeal from "@/models/SavedMeal";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meals = await SavedMeal.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ data: meals });
  } catch (error) {
    console.error("Fetch Meals Error:", error);
    return NextResponse.json({ error: "Error fetching meals" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, items, total } = await req.json();

    if (!name || !items || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMeal = await SavedMeal.create({
      userId: user.id,
      name,
      items,
      total,
    });

    return NextResponse.json({ message: "Meal saved successfully", data: newMeal });
  } catch (error) {
    console.error("Save Meal Error:", error);
    return NextResponse.json({ error: "Error saving meal" }, { status: 500 });
  }
}
