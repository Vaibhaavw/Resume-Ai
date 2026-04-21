import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/**
 * Robust PDF Parser Loader
 */
let parserLoadError: string | null = null;

function getPdfParser() {
  try {
    // Strategy 1: Standard require (should work if externalized and installed)
    const pdf = require("pdf-parse");
    if (typeof pdf === "function") return pdf;
    if (pdf && typeof pdf.default === "function") return pdf.default;
    
    // Strategy 2: Direct lib path
    const pdfLib = require("pdf-parse/lib/pdf-parse.js");
    if (typeof pdfLib === "function") return pdfLib;
    
    parserLoadError = "Module found but no valid function exported";
    return null;
  } catch (err: any) {
    parserLoadError = err.message;
    console.error("[ATS] PDF Parser Load Error:", err);
    return null;
  }
}

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
    const pdfParser = getPdfParser();

    if (req.file.mimetype === "application/pdf") {
      try {
        if (!pdfParser) {
          throw new Error(`PDF parser failed to load: ${parserLoadError}`);
        }
        const data = await pdfParser(req.file.buffer);
        text = data.text || "";
      } catch (parseErr: any) {
        console.warn(`[ATS] PDF parse failed, falling back to string: ${parseErr.message}`);
        text = req.file.buffer.toString("utf-8");
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    const cleanText = text.trim().replace(/\s+/g, " ");
    console.log(`[ATS] Extraction successful. Text length: ${cleanText.length}`);
    
    res.json({ 
      text: cleanText,
      debug: {
        method: req.file.mimetype === "application/pdf" ? "pdf-parse" : "text",
        length: cleanText.length,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        parserLoaded: !!pdfParser,
        parserError: parserLoadError,
        snippet: cleanText.slice(0, 100)
      }
    });
  } catch (error: any) {
    console.error(`[ATS] Extraction fatal error: ${error.message}`);
    res.status(500).json({ 
      error: `Text extraction failed: ${error.message}`,
      debug: { stack: error.stack }
    });
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
