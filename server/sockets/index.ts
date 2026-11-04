import * as http from "node:http";
import { WebSocketServer } from "ws";
import { verifyToken } from "@/utils/jwt.js";
import type { AuthenticatedWebSocket } from "@/types/socket.types.js";
import { activeUsers } from "./active-users.js";
import { handleSocketMessage } from "./message.handler.js";

const initWebSocketServer = (server: http.Server): WebSocketServer => {
	const wss = new WebSocketServer({ noServer: true });

	server.on("upgrade", (request, socket, head) => {
		try {
			const url = new URL(request.url || "", `http://${request.headers.host}`);
			const rawToken = url.searchParams.get("token");

			if (!rawToken || !rawToken.startsWith("Bearer ")) {
				socket.write("HTTP/1.1 401 Unauthorized");
				socket.destroy();
				return;
			}

			const token = rawToken.split(" ")[1];
			if (!token) {
				socket.write("HTTP/1.1 401 Unauthorized");
				socket.destroy();
				return;
			}

			const decoded = verifyToken(token);

			if (!decoded || !decoded.id) {
				socket.write("HTTP/1.1 401 Unauthorized");
				socket.destroy();
				return;
			}

			wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
				ws.user = { id: decoded.id, email: decoded.email };
				wss.emit("connection", ws, request);
			});
		} catch (error) {
			socket.write("HTTP/1.1 403 Forbidden");
			socket.destroy();
		}
	});

	wss.on("connection", (ws: AuthenticatedWebSocket) => {
		if (!ws.user) {
			return;
		}
		const currentUserId = ws.user.id;

		console.log(`User connected to live chat line. ID: ${currentUserId}`);

		if (!activeUsers.has(currentUserId)) {
			activeUsers.set(currentUserId, new Set());
		}
		activeUsers.get(currentUserId)!.add(ws);

		ws.on("message", (rawData) => handleSocketMessage(ws, rawData));

		ws.on("close", () => {
			console.log(`User ${currentUserId} offline`);
			const userSockets = activeUsers.get(currentUserId);
			if (userSockets) {
				userSockets.delete(ws);
				if (userSockets.size === 0) {
					activeUsers.delete(currentUserId);
				}
			}
		});
	});

	return wss;
};

export default initWebSocketServer;
