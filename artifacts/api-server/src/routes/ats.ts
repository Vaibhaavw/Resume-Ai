import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Robust PDF Parser Loader
 */
function getPdfParser() {
  try {
    const pdf = require("pdf-parse");
    if (typeof pdf === "function") return pdf;
    if (typeof pdf.default === "function") return pdf.default;
    
    // Try fallback path if root export is an object without default
    const pdfFallback = require("pdf-parse/dist/pdf-parse/index.js");
    if (typeof pdfFallback === "function") return pdfFallback;
    if (typeof pdfFallback.default === "function") return pdfFallback.default;
    
    throw new Error("No function export found in pdf-parse");
  } catch (err) {
    console.error("[ATS] PDF Parser Load Error:", err);
    // Return a dummy function to prevent crash, fallback to text
    return null;
  }
}

const pdfParser = getPdfParser();

import { db, resumesTable, activityTable } from "@workspace/db";
import { CalculateAtsScoreBody, GetSectorKeywordsParams } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth";
import { getKeywordsForSector, calculateAtsScore } from "../lib/ats-keywords";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Professional PDF Text Extraction
 */
router.post("/ats/extract", requireAuth, upload.single("file"), async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.file) {
      console.error("[ATS] Extraction failed: No file in request");
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    console.log(`[ATS] Extracting text from ${req.file.originalname} (${req.file.mimetype})...`);

    let text = "";
    if (req.file.mimetype === "application/pdf") {
      try {
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        text = result.text;
      } catch (parseErr: any) {
        console.warn(`[ATS] Specialized PDF parse failed, falling back to string: ${parseErr.message}`);
        text = req.file.buffer.toString("utf-8");
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    const cleanText = text.trim().replace(/\s+/g, " ");
    console.log(`[ATS] Extraction successful. Text length: ${cleanText.length}`);
    
    res.json({ text: cleanText });
  } catch (error: any) {
    console.error(`[ATS] Extraction fatal error: ${error.message}`);
    res.status(500).json({ error: `Text extraction failed: ${error.message}` });
  }
});

router.post("/ats/score", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CalculateAtsScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { resumeText, sector, resumeId, jobDescription } = parsed.data;
  const result = calculateAtsScore(resumeText, sector, jobDescription);

  // Update resume ATS score if resumeId provided
  if (resumeId) {
    const [updated] = await db.update(resumesTable).set({ atsScore: result.score }).where(
      and(eq(resumesTable.id, resumeId), eq(resumesTable.userId, req.userId!))
    ).returning();

    if (updated) {
      await db.insert(activityTable).values({
        userId: req.userId!,
        resumeId,
        action: "scored",
        atsScore: result.score,
      });
    }
  }

  res.json(result);
});

router.get("/ats/keywords/:sector", async (req, res): Promise<void> => {
  const rawSector = Array.isArray(req.params.sector) ? req.params.sector[0] : req.params.sector;
  const params = GetSectorKeywordsParams.safeParse({ sector: rawSector });
  if (!params.success) {
    res.status(400).json({ error: "Invalid sector" });
    return;
  }

  const data = getKeywordsForSector(params.data.sector);
  res.json({
    sector: params.data.sector,
    keywords: data.keywords,
    categories: data.categories,
  });
});

export default router;
