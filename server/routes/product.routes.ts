import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import {
	createCheckoutSession,
	createProduct,
	getAllProducts,
	getUserOrders,
	getMyProducts,
	handleWebhook
} from "@/controllers/stripe.controller.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/my", authMiddleware, getMyProducts);
router.get("/orders", authMiddleware, getUserOrders);
router.post("/", authMiddleware, createProduct);
router.post("/checkout", authMiddleware, createCheckoutSession);
router.post("/webhook", handleWebhook);

export default router;