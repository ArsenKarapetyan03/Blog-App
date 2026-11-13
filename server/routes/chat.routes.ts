import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import {
	addChatMembers,
	createChat,
	deleteChatMember,
	getChats,
	updateGroupChat
} from "@/controllers/chat.controller.js";

const router = Router();

router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);
router.patch("/", authMiddleware, updateGroupChat);
router.post("/member", authMiddleware, addChatMembers);
router.delete("/member", authMiddleware, deleteChatMember);

export default router;