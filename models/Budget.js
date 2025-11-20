import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    month: { type: String, required: true }, // "2025-01"
    amount: Number,
    limit: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);

