import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/jwt.js";

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
	res.locals.user = undefined;

	const authHeader = req.headers.authorization;

	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];

		if (token) {
			try {
				const decoded = verifyToken(token);
				res.locals.user = {
					id: Number(decoded.id),
					email: decoded.email
				};
			} catch (err) {
				res.locals.user = undefined;
			}
		}
	}

	return next();
};
