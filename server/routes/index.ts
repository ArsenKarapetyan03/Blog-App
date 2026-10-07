import { Router } from "express";
import blogRoutes from './blog.routes'

const router = Router();

router.use("/post", blogRoutes);

export default router;