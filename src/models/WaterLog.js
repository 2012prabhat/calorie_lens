import mongoose from "mongoose";

const waterEntrySchema = new mongoose.Schema({
  amount: {
    type: Number, // in ml (e.g., 250, 500)
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const waterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    dailyGoal: {
      type: Number,
      default: 2500, // 2500ml default (8-10 glasses)
    },
    entries: [waterEntrySchema],
  },
  { timestamps: true }
);

// Compound index: one record per user per day
waterLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.WaterLog || mongoose.model("WaterLog", waterLogSchema);
