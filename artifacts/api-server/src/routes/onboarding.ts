import { Router, IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, resumesTable, activityTable } from "@workspace/db";
import { CompleteOnboardingBody } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/onboarding", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sector, personalInfo, templateId } = parsed.data;

  // Update user with sector and mark onboarding complete
  await db.update(usersTable).set({
    sector,
    onboardingCompleted: true,
  }).where(eq(usersTable.id, req.userId!));

  // Create initial resume from onboarding data
  const resumeData = {
    personalInfo: {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      linkedIn: null,
      website: null,
      summary: personalInfo.summary,
    },
    education: [],
    experience: [],
    skills: [],
    certifications: [],
  };

  const [resume] = await db.insert(resumesTable).values({
    userId: req.userId!,
    title: `${personalInfo.firstName} ${personalInfo.lastName} - ${sector} Resume`,
    sector,
    templateId: templateId ?? null,
    data: resumeData,
    status: "draft",
  }).returning();

  await db.insert(activityTable).values({
    userId: req.userId!,
    resumeId: resume.id,
    action: "created",
  });

  res.json(resume);
});

export default router;
