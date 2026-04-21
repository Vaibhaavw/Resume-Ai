import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import multer from "multer";
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
        
        // Localized polyfills for pdf-parse-fork compatibility
        if (typeof (globalThis as any).DOMMatrix === "undefined") {
          (globalThis as any).DOMMatrix = class DOMMatrix { constructor() {} };
        }
        if (typeof (globalThis as any).Path2D === "undefined") {
          (globalThis as any).Path2D = class Path2D { constructor() {} };
        }

        const pdf = await import("pdf-parse-fork");
        const parser = pdf.default || pdf;
        const data = await (parser as any)(buffer);
        text = data.text || "";
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
        method: isPdf ? "pdf-parse-fork" : "text",
        mimetype: req.file.mimetype,
        size: req.file.size,
        textLength: cleanText.length,
        diagnostic: {
          hasPdfHeader,
          headerPreview: header,
          isScannedSuspected: cleanText.length === 0 && buffer.length > 5000,
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
