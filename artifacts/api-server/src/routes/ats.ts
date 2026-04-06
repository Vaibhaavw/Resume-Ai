import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, resumesTable, activityTable } from "@workspace/db";
import { CalculateAtsScoreBody, GetSectorKeywordsParams } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth";
import { getKeywordsForSector, calculateAtsScore } from "../lib/ats-keywords";

const router: IRouter = Router();

router.post("/ats/score", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CalculateAtsScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { resumeText, sector, resumeId } = parsed.data;
  const result = calculateAtsScore(resumeText, sector);

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
