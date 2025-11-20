import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,   // 30 seconds timeout
      serverSelectionTimeoutMS: 30000, // wait 30s for server selection
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1); // exit process if DB fails
  }
};

export default connectDB;
