import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
// import * as pdfjs from "pdfjs-dist";

/**
 * Robust PDF Parser Loader
 */
import { extractText } from "unpdf";

/**
 * Stable, Lightweight PDF Text Extractor using unpdf
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const { text } = await extractText(buffer);
    return text || "";
  } catch (err: any) {
    console.error("[ATS] unpdf extraction failed:", err);
    throw new Error(`PDF extraction failed: ${err.message}`);
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
    const buffer = req.file.buffer;
    const isPdf = req.file.mimetype === "application/pdf";
    
    // Deep Diagnostic Checks
    const header = buffer.slice(0, 5).toString();
    const hasPdfHeader = header.startsWith("%PDF");
    
    if (isPdf) {
      try {
        if (!hasPdfHeader) {
          throw new Error(`Invalid PDF header: ${header}`);
        }
        
        const { text: extractedText, metadata } = await extractText(buffer);
        text = extractedText || "";
        
        // If text is still empty, let's look for images (common in scanned PDFs)
        if (!text.trim() && buffer.length > 5000) {
          const bufferStr = buffer.toString("binary");
          const hasImages = bufferStr.includes("/Image") || bufferStr.includes("/XObject");
          if (hasImages) {
            text = "[ERROR_SCANNED_PDF] This PDF appears to be a scanned image. Please upload a text-based PDF for ATS scanning.";
          }
        }
      } catch (parseErr: any) {
        console.warn(`[ATS] PDF parse failed: ${parseErr.message}`);
        text = `[ERROR_CORRUPT] ${parseErr.message}`;
      }
    } else {
      text = buffer.toString("utf-8");
    }

    const cleanText = text.trim().replace(/\s+/g, " ");
    
    res.json({ 
      debug: {
        success: cleanText.length > 0 && !cleanText.startsWith("[ERROR"),
        method: isPdf ? "unpdf" : "text",
        mimetype: req.file.mimetype,
        size: req.file.size,
        textLength: cleanText.length,
        diagnostic: {
          hasPdfHeader,
          headerPreview: header,
          isScannedSuspected: cleanText.includes("SCANNED_PDF"),
          isCorruptSuspected: cleanText.includes("CORRUPT"),
        }
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
