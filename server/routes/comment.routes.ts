import { Router } from "express";
import { create } from "@/controllers/comment.controller.js";
import { authMiddleware } from "@/middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, create);

export default router;