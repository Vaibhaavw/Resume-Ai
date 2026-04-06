import { Router, IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, templatesTable } from "@workspace/db";
import { GetTemplateParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/templates", async (_req, res): Promise<void> => {
  const templates = await db.select().from(templatesTable).orderBy(templatesTable.id);
  res.json(templates);
});

router.get("/templates/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTemplateParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid template ID" });
    return;
  }

  const [template] = await db.select().from(templatesTable).where(eq(templatesTable.id, params.data.id));
  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(template);
});

export default router;
