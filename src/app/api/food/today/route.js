import { NextResponse } from "next/server";
import FoodLog from "@/models/FoodLog";
import Plan from "@/models/Plan";
import dbConnect from "@/lib/dbConnect";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req) {
    await dbConnect();

    const user = await getUserFromToken(req);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const userId = user.id
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
        userId,
        date: { $gte: start, $lte: end },
    });

    const totals = logs.reduce(
        (acc, log) => {
            acc.calories += log.total.calories || 0;
            acc.protein += log.total.protein || 0;
            acc.carbs += log.total.carbs || 0;
            acc.fat += log.total.fat || 0;
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );


    let myPlan = await Plan.findOne({ userId });
    const allItems = logs.flatMap(log => log.items);

    const todayStats = {
        caloriesConsumed: totals.calories,
        caloriesGoal: myPlan.targetCalories,
        protein: { consumed: totals.protein, goal: myPlan.protein },
        carbs: { consumed: totals.carbs, goal: myPlan.carbs },
        fat: { consumed: totals.fat, goal: myPlan.fat },
    }

    return NextResponse.json({
        stats: todayStats,
        items: allItems
    }, { status: 200 });
}