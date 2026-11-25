import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getSubscriptions, getMySubscriptions, cancelSubscription } from "@/controllers/subscription.controller.js";

const router = Router();

router.get("/", getSubscriptions);
router.get("/my", authMiddleware, getMySubscriptions);
router.patch("/:id/cancel", authMiddleware, cancelSubscription);

export default router;