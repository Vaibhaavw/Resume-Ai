import { Router, IRouter } from "express";
import { eq, desc, avg } from "drizzle-orm";
import { db, resumesTable, activityTable, usersTable } from "@workspace/db";
import { requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, req.userId!));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));

  const totalResumes = resumes.length;
  const completedResumes = resumes.filter(r => r.status === "complete").length;
  const draftResumes = resumes.filter(r => r.status === "draft").length;

  const scoredResumes = resumes.filter(r => r.atsScore !== null);
  const averageAtsScore = scoredResumes.length > 0
    ? scoredResumes.reduce((sum, r) => sum + (r.atsScore ?? 0), 0) / scoredResumes.length
    : null;
  const bestAtsScore = scoredResumes.length > 0
    ? Math.max(...scoredResumes.map(r => r.atsScore ?? 0))
    : null;

  const recentResume = resumes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] || null;

  res.json({
    totalResumes,
    averageAtsScore: averageAtsScore ? Math.round(averageAtsScore) : null,
    bestAtsScore,
    completedResumes,
    draftResumes,
    currentTier: user?.tier || "free",
    recentResume,
  });
});

router.get("/dashboard/activity", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const activity = await db
    .select({
      id: activityTable.id,
      resumeId: activityTable.resumeId,
      resumeTitle: resumesTable.title,
      action: activityTable.action,
      timestamp: activityTable.createdAt,
      atsScore: activityTable.atsScore,
    })
    .from(activityTable)
    .leftJoin(resumesTable, eq(activityTable.resumeId, resumesTable.id))
    .where(eq(activityTable.userId, req.userId!))
    .orderBy(desc(activityTable.createdAt))
    .limit(20);

  res.json(activity);
});

export default router;
