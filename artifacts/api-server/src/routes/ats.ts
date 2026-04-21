import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Help Vercel trace dependency
// import pdf from 'pdf-parse'; 

// Polyfill for pdf-parse (pdf.js) compatibility in Node.js
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix { constructor() {} };
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D { constructor() {} };
}

/**
 * Robust PDF Parser Loader
 */
let parserLoadError: string | null = null;

async function getPdfParser() {
  const errors: string[] = [];
  try {
    // Strategy 1: Dynamic Import (best for ESM)
    try {
      const pdfModule: any = await import("pdf-parse");
      const pdf = pdfModule.default || pdfModule;
      if (typeof pdf === "function") return pdf;
      if (pdf && typeof pdf.PDFParse === "function") return pdf.PDFParse;
      errors.push(`Import got ${typeof pdf} (${Object.keys(pdf || {}).join(",")})`);
    } catch (e: any) {
      errors.push(`Import failed: ${e.message}`);
    }

    // Strategy 2: Standard require
    try {
      const pdf = require("pdf-parse");
      if (typeof pdf === "function") return pdf;
      if (pdf && typeof pdf.default === "function") return pdf.default;
      if (pdf && typeof pdf.PDFParse === "function") return pdf.PDFParse;
      errors.push(`Require got ${typeof pdf} (${Object.keys(pdf || {}).join(",")})`);
    } catch (e: any) {
      errors.push(`Require failed: ${e.message}`);
    }

    parserLoadError = errors.join(" | ");
    return null;
  } catch (err: any) {
    parserLoadError = `Fatal loader error: ${err.message}`;
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
    const pdfParser = await getPdfParser();

    if (req.file.mimetype === "application/pdf") {
      try {
        if (!pdfParser) {
          throw new Error(`PDF parser failed to load: ${parserLoadError}`);
        }
        const data = await pdfParser(req.file.buffer);
        text = data.text || "";
      } catch (parseErr: any) {
        console.warn(`[ATS] PDF parse failed: ${parseErr.message}`);
        text = ""; // Don't dump binary data into text
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    const cleanText = text.trim().replace(/\s+/g, " ");
    
    res.json({ 
      debug: {
        success: cleanText.length > 0,
        parserLoaded: !!pdfParser,
        parserError: parserLoadError,
        method: req.file.mimetype === "application/pdf" ? "pdf-parse" : "text",
        mimetype: req.file.mimetype,
        size: req.file.size,
        textLength: cleanText.length,
      },
      text: cleanText,
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
