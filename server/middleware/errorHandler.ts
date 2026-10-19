import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "@/utils/appError.js";

const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
	}

	if (err instanceof multer.MulterError) {
		const message = err.code === "LIMIT_FILE_SIZE"
			? "Each photo must be 5 MB or smaller."
			: err.code === "LIMIT_FILE_COUNT"
				? "You can upload up to 5 photos per post."
				: "Invalid photo upload.";
		return res.status(400).json({ success: false, message });
	}

	console.error("Unhandled Error: ", err);

	return res.status(500).json({
		success: false,
		message: "Internal server error.",
	});
};

export default errorHandler;