import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { cancelSubscription, getSubscriptions } from "@/controllers/subscription.controller.js";

const router = Router();


router.get("/", authMiddleware, getSubscriptions);
router.get("/", authMiddleware, cancelSubscription);

export default router;