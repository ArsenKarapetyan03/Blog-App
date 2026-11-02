import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js"
import { getCurrentUser, getAll, getOne } from "@/controllers/user.controller.js";
import { optionalAuth } from "@/middleware/optionalAuth.js";

const router = Router();

router.get("/", optionalAuth, getAll);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/:id", getOne);

export default router;