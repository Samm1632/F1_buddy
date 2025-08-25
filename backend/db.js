import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/usa-visa-buddy";
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 4000,
    });
    console.log("Connected to MongoDB at", mongoUri);
  } catch (primaryError) {
    console.error("MongoDB connection error:", primaryError);
    if (process.env.USE_MEMORY_DB === "false") {
      throw primaryError;
    }
    console.warn("Falling back to in-memory MongoDB (development only). Set USE_MEMORY_DB=false to disable.");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    const uri = mem.getUri("usa-visa-buddy");
    await mongoose.connect(uri, { autoIndex: true });
    console.log("Connected to in-memory MongoDB");
  }
}

export default mongoose;

