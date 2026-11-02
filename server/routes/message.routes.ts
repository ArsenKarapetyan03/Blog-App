import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getChats, getMessages, createMessage, updateMessage, readMessage, deleteMessage } from "@/controllers/message.controller.js";

const router = Router();

router.get("/chats", authMiddleware, getChats);
router.get("/", authMiddleware, getMessages);
router.post("/", authMiddleware, createMessage);
router.patch("/", authMiddleware, updateMessage);
router.patch("/read", authMiddleware, readMessage);
router.delete("/", authMiddleware, deleteMessage);

export default router;