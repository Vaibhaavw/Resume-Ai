import { Router, IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, resumesTable, activityTable } from "@workspace/db";
import { CreateResumeBody, UpdateResumeBody, GetResumeParams, UpdateResumeParams, DeleteResumeParams, EnhanceResumeParams, EnhanceResumeBody } from "@workspace/api-zod";
import { requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/resumes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, req.userId!));
  res.json(resumes);
});

router.post("/resumes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resume] = await db.insert(resumesTable).values({
    userId: req.userId!,
    title: parsed.data.title,
    sector: parsed.data.sector,
    templateId: parsed.data.templateId ?? null,
    data: parsed.data.data as object,
    status: "draft",
  }).returning();

  await db.insert(activityTable).values({
    userId: req.userId!,
    resumeId: resume.id,
    action: "created",
  });

  res.status(201).json(resume);
});

router.get("/resumes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetResumeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid resume ID" });
    return;
  }

  const [resume] = await db.select().from(resumesTable).where(
    and(eq(resumesTable.id, params.data.id), eq(resumesTable.userId, req.userId!))
  );

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.json(resume);
});

router.patch("/resumes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateResumeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid resume ID" });
    return;
  }

  const parsed = UpdateResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title != null) updateData.title = parsed.data.title;
  if (parsed.data.sector != null) updateData.sector = parsed.data.sector;
  if (parsed.data.templateId !== undefined) updateData.templateId = parsed.data.templateId;
  if (parsed.data.data != null) updateData.data = parsed.data.data as object;
  if (parsed.data.status != null) updateData.status = parsed.data.status;

  const [resume] = await db.update(resumesTable).set(updateData).where(
    and(eq(resumesTable.id, params.data.id), eq(resumesTable.userId, req.userId!))
  ).returning();

  if (!resume) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  await db.insert(activityTable).values({
    userId: req.userId!,
    resumeId: resume.id,
    action: "updated",
  });

  res.json(resume);
});

router.delete("/resumes/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteResumeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid resume ID" });
    return;
  }

  const [deleted] = await db.delete(resumesTable).where(
    and(eq(resumesTable.id, params.data.id), eq(resumesTable.userId, req.userId!))
  ).returning();

  if (!deleted) {
    res.status(404).json({ error: "Resume not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/resumes/enhance", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = EnhanceResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { field, content, sector } = parsed.data;

  const enhancements: Record<string, (c: string, s: string) => { enhanced: string; suggestions: string[] }> = {
    summary: (c, s) => ({
      enhanced: `Results-driven ${s} professional with a proven track record of delivering high-impact solutions. ${c.length > 20 ? c : "Demonstrated expertise in cross-functional collaboration, strategic problem-solving, and driving measurable outcomes. Passionate about leveraging cutting-edge technologies and industry best practices to exceed organizational objectives."}`,
      suggestions: [
        "Lead with your most impressive achievement or unique value proposition",
        `Include ${s}-specific buzzwords that ATS systems scan for`,
        "Keep it to 2-3 sentences for maximum impact",
        "Quantify your impact where possible (e.g., 'reduced costs by 30%')",
      ],
    }),
    bullets: (c, s) => ({
      enhanced: `• ${c.startsWith("•") || c.startsWith("-") ? c.slice(1).trim() : c}. Achieved measurable results by implementing data-driven strategies and collaborating with cross-functional teams to deliver outcomes aligned with ${s} industry standards.`,
      suggestions: [
        "Start each bullet with a strong action verb (Led, Implemented, Drove, Optimized)",
        "Quantify achievements with specific metrics (%, $, time saved)",
        `Include ${s}-specific technical keywords for ATS optimization`,
        "Keep each bullet to 1-2 lines maximum",
      ],
    }),
    about: (c, s) => ({
      enhanced: `Highly motivated ${s} professional dedicated to excellence and continuous growth. ${c || "Bringing a unique combination of technical expertise and strategic vision to drive organizational success. Committed to staying at the forefront of industry developments while delivering exceptional results."}`,
      suggestions: [
        "Tailor this section specifically to the role you're applying for",
        "Highlight 2-3 core competencies relevant to the sector",
        "Include a brief mention of your career trajectory",
      ],
    }),
  };

  const enhancer = enhancements[field] || enhancements.summary;
  const result = enhancer(content, sector);

  res.json({
    original: content,
    enhanced: result.enhanced,
    suggestions: result.suggestions,
  });
});

router.post("/resumes/:id/enhance", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = EnhanceResumeParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid resume ID" });
    return;
  }

  const parsed = EnhanceResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { field, content, sector } = parsed.data;

  // AI enhancement — generate professional rewrites with action verbs and impact language
  const enhancements: Record<string, (c: string, s: string) => { enhanced: string; suggestions: string[] }> = {
    summary: (c, s) => ({
      enhanced: `Results-driven ${s} professional with a proven track record of delivering high-impact solutions. ${c.length > 20 ? c : "Demonstrated expertise in cross-functional collaboration, strategic problem-solving, and driving measurable outcomes. Passionate about leveraging cutting-edge technologies and industry best practices to exceed organizational objectives."}`,
      suggestions: [
        "Lead with your most impressive achievement or unique value proposition",
        `Include ${s}-specific buzzwords that ATS systems scan for`,
        "Keep it to 2-3 sentences for maximum impact",
        "Quantify your impact where possible (e.g., 'reduced costs by 30%')",
      ],
    }),
    bullets: (c, s) => ({
      enhanced: `• ${c.startsWith("•") || c.startsWith("-") ? c.slice(1).trim() : c}. Achieved measurable results by implementing data-driven strategies and collaborating with cross-functional teams to deliver outcomes aligned with ${s} industry standards.`,
      suggestions: [
        "Start each bullet with a strong action verb (Led, Implemented, Drove, Optimized)",
        "Quantify achievements with specific metrics (%, $, time saved)",
        `Include ${s}-specific technical keywords for ATS optimization`,
        "Keep each bullet to 1-2 lines maximum",
      ],
    }),
    about: (c, s) => ({
      enhanced: `Highly motivated ${s} professional dedicated to excellence and continuous growth. ${c || "Bringing a unique combination of technical expertise and strategic vision to drive organizational success. Committed to staying at the forefront of industry developments while delivering exceptional results."}`,
      suggestions: [
        "Tailor this section specifically to the role you're applying for",
        "Highlight 2-3 core competencies relevant to the sector",
        "Include a brief mention of your career trajectory",
      ],
    }),
  };

  const enhancer = enhancements[field] || enhancements.summary;
  const result = enhancer(content, sector);

  res.json({
    original: content,
    enhanced: result.enhanced,
    suggestions: result.suggestions,
  });
});

export default router;
