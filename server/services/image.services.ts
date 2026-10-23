import db from "@/models/index.js";
import type { Transaction } from "sequelize";

interface Image {
	imagePath: string;
}

export const imageService = {
	createImages: async (postId: number, images: Image[], transaction?: Transaction) => {
		if (images.length === 0) {
			return [];
		}

		return db.Image.bulkCreate(images.map(image => ({
			postId,
			imagePath: image.imagePath
		})), transaction ? {transaction} : {});
	},
	deleteImages: async (postId: number, imagePaths: string[], transaction?: Transaction) => {
		if (imagePaths.length === 0) {
			return 0;
		}

		return db.Image.destroy({
			where: {postId, imagePath: imagePaths},
			...(transaction ? {transaction} : {})
		});
	}
};
