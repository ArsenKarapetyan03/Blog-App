import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { createChat, getChats } from "@/controllers/chat.controller.js";

const router = Router();

router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);

export default router;