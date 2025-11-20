import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  color: String,
});

export default mongoose.model("Category", categorySchema);
