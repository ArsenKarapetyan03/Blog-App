import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({message: "Authentication required. Please sign-in."});
	}

	try {
		const decoded = verifyToken(token);

		if (!decoded || !decoded.id) {
			throw new Error("Invalid token payload structure");
		}

		req.user = {id: decoded.id, email: decoded.email};

		return next();
	} catch (error) {
		return res.status(403).json({message: "Invalid or expired token."});
	}
};
