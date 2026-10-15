import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.js";

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		try {
			if (!token) {
				throw new Error("Unauthorized");
			}

			const decoded = verifyToken(token);
			req.user = {id: decoded.id, email: decoded.email};
		} catch (err) {
			req.user = undefined;
		}
	}

	next();
};
