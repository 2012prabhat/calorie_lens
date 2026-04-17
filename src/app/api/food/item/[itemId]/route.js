import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FoodLog from "@/models/FoodLog";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {itemId} = await params;

    // 🔍 Find log containing this item
    const log = await FoodLog.findOne({
      userId: user.id,
      "items._id": itemId,
    });

    if (!log) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // 🗑️ Remove item
    log.items = log.items.filter(
      (item) => item._id.toString() !== itemId
    );

    // 🧠 Recalculate totals
    const total = log.items.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    log.total = total;

    // 💾 Save
    await log.save();

    return NextResponse.json({
      message: "Item deleted successfully",
      data: log,
    });

  } catch (error) {
    console.error("Delete Item Error:", error);

    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}