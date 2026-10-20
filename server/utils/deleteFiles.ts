import { unlink } from "node:fs/promises";
import path from "node:path";
import { uploadsDirectory } from "@/middleware/imagesMiddleware.js";

export const deletePhysicalFiles = async (imagePaths: string[]) => {
	if (!imagePaths || imagePaths.length === 0) {
		return;
	}

	for (const imgPath of imagePaths) {
		try {
			const filename = path.basename(imgPath);
			const fullPath = path.join(uploadsDirectory, filename);

			await unlink(fullPath);
		} catch (err: any) {
			console.error(`File Delete Error ${imgPath}:`, err.message);
		}
	}
};
