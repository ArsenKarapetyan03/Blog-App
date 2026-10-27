declare global {
	namespace Express {
		interface Locals {
			user: {
				id: number;
				email: string;
			} | undefined;
			friendId: number;
		}
	}
}

export {};