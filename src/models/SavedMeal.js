import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const healthScoreSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 70,
  },
  grade: {
    type: String, // 'A', 'B', 'C', 'D', 'E'
    default: 'B',
  },
  label: {
    type: String,
    default: 'Balanced',
  },
});

const insightsSchema = new mongoose.Schema({
  fiberLevel: String, // 'High', 'Moderate', 'Low'
  processingLevel: String, // 'Whole Food', 'Minimally Processed', 'Moderately Processed', 'Ultra-Processed'
  sugarLevel: String, // 'Low', 'Moderate', 'High'
  healthySwapTip: String,
  pros: [String],
  cons: [String],
});

const savedMealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    items: [foodItemSchema],

    total: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },

    healthScore: healthScoreSchema,
    insights: insightsSchema,
  },
  { timestamps: true }
);

export default mongoose.models.SavedMeal || mongoose.model("SavedMeal", savedMealSchema);
