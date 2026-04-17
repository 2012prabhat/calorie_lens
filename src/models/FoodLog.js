import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String, // "I ate 2 roti and dal"
      required: true,
    },

    items: [foodItemSchema],

    total: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FoodLog || mongoose.model("FoodLog", foodLogSchema);