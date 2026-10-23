import { getValidatedPost } from "@/utils/dataValidation.js";
import { getPaginationDirectives } from "@/utils/getPaginationDirective.js";
import { deletePhysicalFiles } from "@/utils/deleteFiles.js";
import { AppError } from "@/utils/appError.js";
import { postService } from "@/services/post.service.js";
const readPosts = async (req, res, userId) => {
    const { limit, offset } = getPaginationDirectives(req.query);
    const searchString = String(req.query.query ?? "").trim();
    const { posts, count } = await postService.getPosts({
        searchString,
        userId,
        limit,
        offset
    });
    return res.status(200).json({
        posts,
        totalCount: count,
        totalPages: Math.ceil(count / limit || 1),
    });
};
export const readAll = (req, res) => readPosts(req, res);
export const readMine = (req, res) => {
    if (!req.user) {
        throw new AppError("Authentication required. Please sign-in.", 401);
    }
    return readPosts(req, res, req.user.id);
};
export const readOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError("Post not found", 404);
    }
    const post = await postService.getPostById(Number(id), req.user?.id);
    if (!post) {
        throw new AppError("Post not found", 404);
    }
    return res.status(200).json(post);
};
export const create = async (req, res) => {
    if (!req.user) {
        throw new AppError("Authentication required. Please sign-in.", 401);
    }
    const { title, excerpt, description } = getValidatedPost(req.body);
    const files = req.files || [];
    const imagesData = files.map(file => ({
        imagePath: `/uploads/${file.filename}`
    }));
    const newPost = await postService.createPost({
        userId: req.user.id,
        title,
        excerpt,
        description,
        Images: imagesData,
    });
    if (!newPost || !newPost.get("id")) {
        throw new AppError("Failed to create post record", 500);
    }
    return res.status(201).json({ success: true, message: "Post created successfully.", post: newPost });
};
export const update = async (req, res) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError("Authentication required. Please sign-in.", 401);
    }
    if (!id) {
        throw new AppError("Post ID is required", 400);
    }
    const postId = Number(id);
    let existingImagePaths;
    if (req.body.existingPhotos !== undefined) {
        try {
            const parsedPhotos = JSON.parse(req.body.existingPhotos);
            if (!Array.isArray(parsedPhotos) || !parsedPhotos.every(photo => typeof photo === "string")) {
                throw new Error("Expected an array of image URLs");
            }
            existingImagePaths = parsedPhotos
                .map(photo => new URL(photo, "http://localhost").pathname)
                .filter(imagePath => imagePath.startsWith("/uploads/"));
        }
        catch {
            throw new AppError("Invalid existingPhotos format", 400);
        }
    }
    const { title, excerpt, description } = getValidatedPost(req.body);
    const files = req.files || [];
    const imagesData = files.map(file => ({ imagePath: `/uploads/${file.filename}` }));
    const result = await postService.updatePost({
        id: postId,
        userId: req.user.id,
        title,
        excerpt,
        description,
        Images: imagesData,
        ...(existingImagePaths === undefined ? {} : { existingImagePaths }),
    });
    if (!result.success) {
        throw new AppError("Post not found", 404);
    }
    if (result.removedImagePaths.length > 0) {
        const deletion = await deletePhysicalFiles(result.removedImagePaths);
        if (!deletion.success) {
            console.warn("Some physical files could not be deleted:", deletion.message);
        }
    }
    return res.status(200).json({ success: true, message: "Post updated successfully!" });
};
export const remove = async (req, res) => {
    const { id } = req.params;
    if (!req.user) {
        throw new AppError("Authentication required. Please sign-in.", 401);
    }
    const postId = Number(id);
    if (isNaN(postId)) {
        throw new AppError("Invalid Post ID format. It must be a number.", 400);
    }
    const result = await postService.deletePost(postId, req.user.id);
    if (!result.success) {
        throw new AppError("Post not found", 404);
    }
    if (result.imagePaths && result.imagePaths.length > 0) {
        const response = await deletePhysicalFiles(result.imagePaths);
        if (!response.success) {
            console.warn("Some physical files could not be deleted:", response.message);
        }
    }
    return res.status(200).json({ success: true, message: "Post deleted successfully!" });
};
export const toggleLike = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new AppError("Post not found", 404);
    }
    if (!req.user) {
        throw new AppError("Authentication required.", 401);
    }
    const result = await postService.toggleLike(Number(id), req.user.id);
    return res.status(200).json(result);
};
//# sourceMappingURL=post.controller.js.map