import { unlink } from "node:fs/promises";
import path from "node:path";
import { uploadsDirectory } from "@/middleware/imagesMiddleware.js";

export const deletePhysicalFiles = async (imagePaths: string[]) => {
	if (!imagePaths || imagePaths.length === 0) {
		return {success: false, message: "No images provided."};
	}

	const deletionPromises = imagePaths.map(async (img) => {
		try {
			let cleanPath = img.startsWith("/") ? img.slice(1) : img;

			if (cleanPath.startsWith("uploads/")) {
				cleanPath = cleanPath.replace("uploads/", "");
			}

			cleanPath = path.normalize(cleanPath).replace(/^(\.\.(\/|\\))+/, "");

			const fullPath = path.join(uploadsDirectory, cleanPath);

			await unlink(fullPath);
			return {path: img, status: "deleted"};
		} catch (err: any) {
			if (err.code === 'ENOENT') {
				console.warn(`File already missing [${img}]:`, err.message);
				return { path: img, status: "already_missing" };
			}

			console.error(`File Delete Error [${img}]:`, err.message);
			return { path: img, status: "failed", error: err.message };
		}
	});

	const results = await Promise.all(deletionPromises);

	const failedDeletions = results.filter(r => r.status === "failed");

	return {
		success: failedDeletions.length === 0,
		message: failedDeletions.length === 0
			? "All files deleted successfully."
			: `${failedDeletions.length} file(s) failed to delete.`,
		details: results
	};
};
