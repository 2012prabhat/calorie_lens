import mongoose from "mongoose";

const weightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    weight: {
        type: Number,
    },
    chest: {
        type: Number,
    },
    waist: {
        type: Number,
    },
    stomach: {
        type: Number,
    },
    unit: {
        type: String,
        default: "in",
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.models.Weight || mongoose.model("Weight", weightSchema);