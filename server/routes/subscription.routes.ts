import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import {
	getSubscriptions,
	getMySubscriptions,
	cancelAtPeriodEndSubscription,
	cancelSubscriptionNow
} from "@/controllers/subscription.controller.js";

const router = Router();

router.get("/", getSubscriptions);
router.get("/my", authMiddleware, getMySubscriptions);
router.patch("/:id/cancel", authMiddleware, cancelAtPeriodEndSubscription);
router.patch("/:id/cancel-now", authMiddleware, cancelSubscriptionNow);

export default router;