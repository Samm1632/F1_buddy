import mongoose from "../db.js";

const VisaDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

VisaDocSchema.index({ title: "text", category: "text", content: "text" });

const VisaDoc = mongoose.model("VisaDoc", VisaDocSchema);
export default VisaDoc;

