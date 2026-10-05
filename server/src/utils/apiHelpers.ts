import type { Response } from "express";

export const sendError = (res: Response, error: unknown, statusCode = 400) => {
	console.error(error);
	const message = error instanceof Error ? error.message : "Unknown error";
	return res.status(statusCode).json({
		success: false,
		message
	});
};