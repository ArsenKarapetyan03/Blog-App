import { Router } from "express";
import { signIn, signUp, getUser } from "@/controllers/auth.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";

const router = Router();

router.post("/sign-in", signIn);
router.post("/sign-up", signUp);
router.get("/me", authMiddleware, getUser);

export default router;