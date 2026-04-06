import { Router, IRouter } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable, subscriptionsTable } from "@workspace/db";
import { RegisterUserBody, LoginUserBody, RequestPasswordResetBody, UpdatePasswordBody } from "@workspace/api-zod";
import { hashPassword, comparePassword, signToken, requireAuth, AuthRequest } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    tier: "free",
    onboardingCompleted: false,
  }).returning();

  // Create free subscription
  await db.insert(subscriptionsTable).values({
    userId: user.id,
    tier: "free",
    atsScoreGuarantee: "60-75%",
    templateCount: 3,
    features: ["3 basic templates", "ATS score (60-75%)", "PDF export"],
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      sector: user.sector,
      onboardingCompleted: user.onboardingCompleted,
      tier: user.tier,
      createdAt: user.createdAt,
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      sector: user.sector,
      onboardingCompleted: user.onboardingCompleted,
      tier: user.tier,
      createdAt: user.createdAt,
    },
    token,
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    sector: user.sector,
    onboardingCompleted: user.onboardingCompleted,
    tier: user.tier,
    createdAt: user.createdAt,
  });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = RequestPasswordResetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await db.update(usersTable).set({ resetToken: token, resetTokenExpiresAt: expiresAt }).where(eq(usersTable.id, user.id));
    req.log.info({ email }, "Password reset token generated");
  }

  // Always return success to avoid email enumeration
  res.json({ message: "If an account exists, a reset email has been sent" });
});

router.post("/auth/update-password", async (req, res): Promise<void> => {
  const parsed = UpdatePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { token, newPassword } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash, resetToken: null, resetTokenExpiresAt: null }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password updated successfully" });
});

export default router;
