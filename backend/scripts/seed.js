import dotenv from "dotenv";
import { connectToDatabase } from "../db.js";
import VisaDoc from "../models/VisaDoc.js";
import { embedText } from "../services/rag.js";

dotenv.config();

async function run() {
  try {
    await connectToDatabase();
    const docs = defaultVisaDocs();
    const embeddedDocs = [];
    for (const doc of docs) {
      const embedding = await embedText([doc.title, doc.category, doc.content].join("\n"));
      embeddedDocs.push({ ...doc, embedding });
    }
    await VisaDoc.deleteMany({});
    const result = await VisaDoc.insertMany(embeddedDocs);
    console.log(`Seeded ${result.length} visa docs.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

function defaultVisaDocs() {
  return [
    {
      title: "B-1 Business Visitor Visa Overview",
      category: "B-1",
      content:
        "The B-1 visa is for individuals visiting the U.S. temporarily for business activities such as meetings, conferences, or consultations. Employment in the U.S. is not permitted. Typical stay: up to 6 months with possible extension. Evidence includes invitation letters and itinerary.",
    },
    {
      title: "B-2 Tourist Visa Overview",
      category: "B-2",
      content:
        "The B-2 visa is for tourism, visiting friends or relatives, or medical treatment. No employment is allowed. Applicants must show ties to their home country and sufficient funds. Typical stay: up to 6 months.",
    },
    {
      title: "H-1B Specialty Occupation Requirements",
      category: "H-1B",
      content:
        "H-1B is for specialty occupations requiring at least a bachelor's degree or equivalent. Employer must obtain a certified Labor Condition Application and file Form I-129. Annual cap applies. Dual intent allowed. Initial period up to 3 years, extendable to 6 years.",
    },
    {
      title: "F-1 Student Visa Basics",
      category: "F-1",
      content:
        "F-1 is for full-time academic students at SEVP-certified schools. Requires Form I-20 and proof of financial ability. On-campus work limited; off-campus work allowed via CPT/OPT with authorization. Maintain full-time enrollment and valid I-20.",
    },
    {
      title: "EB-2 Employment-Based Green Card Overview",
      category: "EB-2",
      content:
        "EB-2 is for advanced degree professionals or individuals with exceptional ability. Typically requires PERM labor certification unless applying under the National Interest Waiver (NIW). File Form I-140 and, when available, I-485 for adjustment of status.",
    },
    {
      title: "O-1 Extraordinary Ability",
      category: "O-1",
      content:
        "O-1 is for individuals with extraordinary ability in sciences, arts, education, business, athletics, or motion picture/TV. Requires evidence of sustained acclaim, a U.S. petitioner, advisory opinion, and itinerary of events.",
    },
    {
      title: "L-1 Intracompany Transferee",
      category: "L-1",
      content:
        "L-1 allows multinational companies to transfer executives/managers (L-1A) or specialized knowledge workers (L-1B) to a U.S. office. Requires qualifying relationship and one continuous year of employment abroad within the preceding three years.",
    },
    {
      title: "Adjustment of Status vs Consular Processing",
      category: "General",
      content:
        "Permanent residence can be pursued via adjustment of status (if in the U.S. and eligible) or consular processing (if abroad). Each has distinct steps, interview locations, and processing times. Consider travel and status implications.",
    },
  ];
}

run();

