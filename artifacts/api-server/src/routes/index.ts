import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import resumesRouter from "./resumes";
import atsRouter from "./ats";
import templatesRouter from "./templates";
import subscriptionRouter from "./subscription";
import dashboardRouter from "./dashboard";
import onboardingRouter from "./onboarding";
import webhookRouter from "./webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(resumesRouter);
router.use(atsRouter);
router.use(templatesRouter);
router.use(subscriptionRouter);
router.use(dashboardRouter);
router.use(onboardingRouter);
router.use(webhookRouter);

export default router;
