import mongoose from "mongoose";

const unlockedBadgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
});

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String, // YYYY-MM-DD
    },
    unlockedBadges: [unlockedBadgeSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
