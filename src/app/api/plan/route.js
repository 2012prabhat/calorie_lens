import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Plan from "@/models/Plan";
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

    // 📥 Get body
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
    } = await req.json();

    // ✅ Validation
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🧠 1. BMR Calculation
    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // 🧠 2. Activity Multiplier
    const activityMap = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };

    const tdee = bmr * activityMap[activityLevel];

    // 🧠 3. Goal Adjustment
    let targetCalories = tdee;

    if (goal === "lose") targetCalories -= 500;
    if (goal === "gain") targetCalories += 500;

    // 🧠 4. Macros
    const protein = (targetCalories * 0.3) / 4;
    const carbs = (targetCalories * 0.4) / 4;
    const fat = (targetCalories * 0.3) / 9;

    // 🔥 5. UPSERT (only one plan per user)
    const plan = await Plan.findOneAndUpdate(
      { userId: user.id }, // ✅ correct field
      {
        userId: user.id,
        goal,
        targetCalories: Math.round(targetCalories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
      },
      {
        new: true,
        upsert: true,
      }
    );

    // ✅ Response
    return NextResponse.json(
      {
        message: "Plan saved successfully",
        data: plan,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Plan Error:", error);

    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plan = await Plan.find({userId:user.id});

    return NextResponse.json({ data: plan });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}