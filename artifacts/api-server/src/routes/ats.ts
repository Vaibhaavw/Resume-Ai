import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
import * as pdfjs from "pdfjs-dist";

/**
 * Robust PDF Parser Loader
 */
import PDFParser from "pdf2json";

/**
 * Industry-standard PDF Text Extractor using Mozilla PDF.js
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({
      data,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items
        .map((item: any) => item.str)
        .filter((s: string) => s.trim().length > 0);
      
      fullText += strings.join(" ") + "\n";
    }
    
    return fullText.trim();
  } catch (err: any) {
    console.error("[ATS] PDF.js extraction failed:", err);
    throw new Error(`PDF.js extraction failed: ${err.message}`);
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
    if (req.file.mimetype === "application/pdf") {
      try {
        text = await extractTextFromPdf(req.file.buffer);
      } catch (parseErr: any) {
        console.warn(`[ATS] PDF parse failed: ${parseErr.message}`);
        text = "";
      }
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    const cleanText = text.trim().replace(/\s+/g, " ");
    
    res.json({ 
      debug: {
        success: cleanText.length > 0,
        method: req.file.mimetype === "application/pdf" ? "pdfjs-dist" : "text",
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
