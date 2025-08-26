import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./db.js";
import queryRouter from "./routes/query.js";
import seedRouter from "./routes/seed.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/query", queryRouter);
app.use("/api/seed", seedRouter);

const port = process.env.PORT || 5000;

async function start() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`USA Visa Buddy backend listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

