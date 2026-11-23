import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getBalance } from "@/controllers/sellerBalance.controller.js";

const router = Router();

router.get("/", authMiddleware, getBalance);

export default router;