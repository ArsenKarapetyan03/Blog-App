import { Router } from "express";
import postRoutes from "./post.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import commentRoutes from "./comment.routes.js";
import friendshipRoutes from "./friendship.routes.js";
import messageRoutes from "@/routes/message.routes.js";
import chatRoutes from "@/routes/chat.routes.js";
const router = Router();
router.use("/blog", postRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/comment", commentRoutes);
router.use("/friend", friendshipRoutes);
router.use("/message", messageRoutes);
router.use("/chat", chatRoutes);
export default router;
//# sourceMappingURL=index.js.map