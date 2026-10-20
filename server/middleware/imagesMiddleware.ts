import { mkdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError.js";

export const uploadsDirectory = path.resolve(import.meta.dirname, ".././uploads");
mkdirSync(uploadsDirectory, { recursive: true });

const ALLOWED_TYPES: Record<string, string> = {
	"image/avif": ".avif",
	"image/gif": ".gif",
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp"
};

const storage = multer.diskStorage({
	destination: (_, __, cb) => cb(null, uploadsDirectory),
	filename: (_, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`)
});

const uploadPhotos = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024, files: 5 },
	fileFilter: (_, file, cb) => {
		if (!file?.mimetype || file.mimetype === "application/octet-stream") {
			return cb(null, false);
		}

		if (!(file.mimetype in ALLOWED_TYPES)) {
			return cb(new AppError("Only JPEG, PNG, GIF, WebP, and AVIF images are allowed.", 400));
		}
		cb(null, true);
	}
}).array("photos", 5);

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
	uploadPhotos(req as any, res as any, (err) => {
		if (err instanceof multer.MulterError) {
			return next(new AppError(`Multer error: ${err.message}`, 400));
		}
		if (err) {
			return next(err);
		}

		req.files = Array.isArray(req.files) ? req.files : [];
		next();
	});
};
