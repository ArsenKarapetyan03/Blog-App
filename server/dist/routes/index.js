import { Router } from "express";
import postRoutes from "./post.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import commentRoutes from "./comment.routes.js";
import friendshipRoutes from "./friendship.routes.js";
const router = Router();
router.use("/blog", postRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/comment", commentRoutes);
router.use("/friend", friendshipRoutes);
export default router;
//# sourceMappingURL=index.js.map