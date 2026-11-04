import type { AuthenticatedWebSocket } from "@/types/socket.types.js";

export const activeUsers = new Map<number, Set<AuthenticatedWebSocket>>();

export const broadcastToUser = (userId: number, data: any) => {
	const stringified = JSON.stringify(data);
	activeUsers.get(userId)?.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(stringified);
		}
	});
};
