import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SavedMeal from "@/models/SavedMeal";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deletedMeal = await SavedMeal.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deletedMeal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Delete Meal Error:", error);
    return NextResponse.json({ error: "Error deleting meal" }, { status: 500 });
  }
}
