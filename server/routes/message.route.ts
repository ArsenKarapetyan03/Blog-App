import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getChats, getMessages } from "@/controllers/message.controller.js";

const router = Router();

router.get("/", authMiddleware, getChats);

export default router;