import { Router } from "express";
import { getUserOrders, refundOrder, shipOrder } from "@/controllers/order.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getUserOrders);
router.post("/:id/refund", authMiddleware, );
router.patch("/:id/ship", authMiddleware, shipOrder);
router.post("/:id/refund", authMiddleware, refundOrder);

export default router;