import db from "@/models/index.js";
export const imageService = {
    createImages: async (postId, images, transaction) => {
        if (images.length === 0) {
            return [];
        }
        return db.Image.bulkCreate(images.map(image => ({
            postId,
            imagePath: image.imagePath
        })), transaction ? { transaction } : {});
    },
    deleteImages: async (postId, imagePaths, transaction) => {
        if (imagePaths.length === 0) {
            return 0;
        }
        return db.Image.destroy({
            where: { postId, imagePath: imagePaths },
            ...(transaction ? { transaction } : {})
        });
    }
};
//# sourceMappingURL=image.service.js.map