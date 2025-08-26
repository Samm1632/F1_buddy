import { Router } from "express";
import { generateAnswer, getRelevantDocs } from "../services/rag.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Invalid 'question' provided" });
    }

    const docs = await getRelevantDocs(question, 5);
    const answer = await generateAnswer(question, docs);

    const sources = docs.map((d, idx) => ({
      id: String(d._id || idx),
      title: d.title,
      category: d.category,
      score: d.score,
    }));

    return res.json({ answer, sources });
  } catch (error) {
    console.error("/api/query error:", error);
    return res.status(500).json({ error: "Failed to answer query" });
  }
});

export default router;

