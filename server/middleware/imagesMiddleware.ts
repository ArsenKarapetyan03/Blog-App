import { mkdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer, { type StorageEngine } from "multer";
import { AppError } from "@/utils/appError.js";

export const uploadsDirectory = path.resolve(import.meta.dirname, ".././uploads");
mkdirSync(uploadsDirectory, {recursive: true});

const imageExtensions: Record<string, string> = {
	"image/avif": ".avif",
	"image/gif": ".gif",
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
};

const storage: StorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsDirectory);
	},
	filename: (req, file, cb) => {
		cb(null, `${crypto.randomUUID()}${imageExtensions[file.mimetype]}`);
	},
});

export const uploadPhotos = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 5,
	},
	fileFilter: (req, file, cb) => {
		if (!imageExtensions[file.mimetype]) {
			cb(new AppError("Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.", 400));
			return;
		}
		cb(null, true);
	},
}).array("photos", 5);