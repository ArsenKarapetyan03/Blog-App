import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import {
	createCheckoutSession,
	createProduct,
	getAllProducts,
	getMyProducts,
	handleWebhook,
	archiveProduct,
	updateProduct, getProductById, cancelCheckoutSession
} from "@/controllers/stripe.controller.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/my", authMiddleware, getMyProducts);
router.get("/:id", getProductById);
router.post("/", authMiddleware, createProduct);
router.post("/checkout", authMiddleware, createCheckoutSession);
router.post("/webhook", handleWebhook);
router.post("/cancel", authMiddleware, cancelCheckoutSession);
router.patch("/:id", authMiddleware, updateProduct);
router.patch("/:id/archive", authMiddleware, archiveProduct);

export default router;