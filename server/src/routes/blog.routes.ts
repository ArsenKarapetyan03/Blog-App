import * as controllers from "../controllers/blog.controller.js"
import { Router } from "express";

const router = Router();

router.get("/posts", controllers.getPosts);
router.get("/posts/:id", controllers.getPost);
router.post("/add", controllers.createPost);
router.put("/edit/:id", controllers.updatePost);
router.delete("/delete/:id", controllers.deletePost);

export default router;