import mongoose from "mongoose";

export async function connectDb(url: string) {
  try {
    const mongoUrl = await mongoose.connect(url);

    if (!mongoUrl) {
      throw new Error("MONGO_DB_URL is required");
    }
    console.log("Database connected");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
