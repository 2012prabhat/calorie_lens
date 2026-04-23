import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
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
  },
  { timestamps: true }
);

export default mongoose.models.SavedMeal || mongoose.model("SavedMeal", savedMealSchema);
