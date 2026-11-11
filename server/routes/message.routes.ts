import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware.js";
import { getMessages, readMessage } from "@/controllers/message.controller.js";

const router = Router();

router.get("/", authMiddleware, getMessages);
router.patch("/read", authMiddleware, readMessage);

export default router;