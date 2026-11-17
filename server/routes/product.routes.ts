import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { createCheckoutSession, createProduct, getUserProducts } from "@/controllers/stripe.controller.js";

const router = Router();

router.get("/", getUserProducts);
router.post("/", authMiddleware, createProduct);
router.post("/checkout", authMiddleware, createCheckoutSession);
router.delete("/:id", authMiddleware, );

export default router;