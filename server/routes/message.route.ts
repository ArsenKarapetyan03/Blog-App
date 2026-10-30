import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getChats, getMessages, createMessage } from "@/controllers/message.controller.js";

const router = Router();

router.get("/chats", authMiddleware, getChats);
router.get("/", authMiddleware, getMessages);
router.post("/", authMiddleware, createMessage);

export default router;