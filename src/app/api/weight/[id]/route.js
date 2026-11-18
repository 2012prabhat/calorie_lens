import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Weight from "@/models/Weight";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deletedEntry = await Weight.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deletedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Metric entry deleted successfully" });
  } catch (error) {
    console.error("Delete Metric Error:", error);
    return NextResponse.json({ error: "Error deleting metric entry" }, { status: 500 });
  }
}
