import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getChats, getMessages, createMessage, readMessage } from "@/controllers/message.controller.js";

const router = Router();

router.get("/chats", authMiddleware, getChats);
router.get("/", authMiddleware, getMessages);
router.post("/", authMiddleware, createMessage);
router.patch("/read", authMiddleware, readMessage);

export default router;