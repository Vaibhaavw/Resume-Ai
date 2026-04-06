import { Router, IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { UpdateSubscriptionBody } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth";

const TIER_CONFIG = {
  free: {
    atsScoreGuarantee: "60-75%",
    templateCount: 3,
    features: ["3 basic templates", "ATS score (60-75%)", "PDF export"],
  },
  pro: {
    atsScoreGuarantee: "75-90%",
    templateCount: 10,
    features: ["10 templates", "ATS score (75-90%)", "AI bullet point suggestions", "PDF & Word export", "Priority support"],
  },
  premium: {
    atsScoreGuarantee: "95%+",
    templateCount: 999,
    features: ["All templates", "95%+ ATS optimization", "Cover letter generator", "AI-powered rewrites", "Priority support", "Early access to new features"],
  },
};

const router: IRouter = Router();

router.get("/subscription", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [subscription] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));
  if (!subscription) {
    // Create default free subscription
    const [newSub] = await db.insert(subscriptionsTable).values({
      userId: req.userId!,
      tier: "free",
      ...TIER_CONFIG.free,
    }).returning();
    res.json(newSub);
    return;
  }
  res.json(subscription);
});

router.patch("/subscription", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tier } = parsed.data;
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const [existing] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, req.userId!));

  let subscription;
  if (existing) {
    [subscription] = await db.update(subscriptionsTable).set({
      tier,
      ...config,
      renewsAt,
    }).where(eq(subscriptionsTable.userId, req.userId!)).returning();
  } else {
    [subscription] = await db.insert(subscriptionsTable).values({
      userId: req.userId!,
      tier,
      ...config,
      renewsAt,
    }).returning();
  }

  // Also update user tier
  await db.update(usersTable).set({ tier }).where(eq(usersTable.id, req.userId!));

  res.json(subscription);
});

export default router;
