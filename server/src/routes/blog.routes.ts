import * as controllers from "../controllers/blog.controller.js"
import { Router } from "express";

const router = Router();

router.get('/get', controllers.getPosts);
router.post('/add', controllers.createPost)
router.put('/edit', controllers.updatePost)
router.delete('/delete', controllers.deletePost)

export default router;