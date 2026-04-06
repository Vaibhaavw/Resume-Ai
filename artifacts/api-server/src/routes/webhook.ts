import { Router, IRouter } from "express";
import { TriggerSignupWebhookBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

router.post("/webhook/n8n-signup", async (req, res): Promise<void> => {
  const parsed = TriggerSignupWebhookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId, email, name } = parsed.data;

  if (N8N_WEBHOOK_URL) {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
          name,
          event: "user_signup",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        logger.warn({ status: response.status, email }, "n8n webhook returned non-200 status");
      } else {
        logger.info({ userId, email }, "n8n welcome email webhook triggered successfully");
      }
    } catch (err) {
      logger.error({ err, email }, "Failed to trigger n8n welcome email webhook");
    }
  } else {
    logger.info({ userId, email }, "n8n webhook URL not configured — skipping (set N8N_WEBHOOK_URL env var)");
  }

  res.json({ message: "Webhook processed" });
});

export default router;
