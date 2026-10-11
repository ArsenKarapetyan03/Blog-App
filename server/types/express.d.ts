import type { User } from "@/types/types.js";

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export {};