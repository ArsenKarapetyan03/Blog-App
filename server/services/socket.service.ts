import * as http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "@/utils/jwt.js";
import { createMessage, updateMessage, readMessage, deleteMessage } from "@/controllers/message.controller.js";

export interface AuthenticatedWebSocket extends WebSocket {
	user?: {
		id: number;
		email: string;
	};
}

const activeUsers = new Map<number, Set<AuthenticatedWebSocket>>();

const initWebSocketServer = (server: http.Server): WebSocketServer => {
	const wss = new WebSocketServer({ noServer: true });

	server.on("upgrade", (request, socket, head) => {
		try {
			const url = new URL(request.url || "", `http://${request.headers.host}`);
			const rawToken = url.searchParams.get("token");

			if (!rawToken || !rawToken.startsWith("Bearer ")) {
				socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
				socket.destroy();
				return;
			}

			const token = rawToken.split(" ")[1];

			if (!token) {
				socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
				socket.destroy();
				return;
			}

			const decoded = verifyToken(token);

			if (!decoded || !decoded.id) {
				socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
				socket.destroy();
				return;
			}

			wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
				ws.user = {
					id: decoded.id,
					email: decoded.email
				};
				wss.emit("connection", ws, request);
			});
		} catch (error) {
			socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
			socket.destroy();
		}
	});

	wss.on("connection", (ws: AuthenticatedWebSocket) => {
		if (!ws.user) return;
		const currentUserId = ws.user.id;

		console.log(`User connected to live chat line. ID: ${currentUserId}`);

		if (!activeUsers.has(currentUserId)) {
			activeUsers.set(currentUserId, new Set());
		}
		activeUsers.get(currentUserId)!.add(ws);

		ws.on("message", async (rawData) => {
			try {
				const parsedData = JSON.parse(rawData.toString());
				const { receiver_id, messageText } = parsedData.payload;
				console.log(receiver_id, messageText);
				if (!receiver_id || !messageText) {
					return;
				}

				const targetReceiverId = Number(receiver_id);

				const messagePayload = {
					sender_id: currentUserId,
					receiver_id: targetReceiverId,
					messageText: messageText,
				};

				// TODO: Giving messagePayload to DB

				const stringifiedPayload = JSON.stringify(messagePayload);

				const receiverSockets = activeUsers.get(targetReceiverId);
				if (receiverSockets) {
					receiverSockets.forEach((client) => {
						if (client.readyState === WebSocket.OPEN) {
							client.send(stringifiedPayload);
						}
					});
				}

				const senderSockets = activeUsers.get(currentUserId);
				if (senderSockets) {
					senderSockets.forEach((client) => {
						if (client !== ws && client.readyState === WebSocket.OPEN) {
							client.send(stringifiedPayload);
						}
					});
				}

			} catch (e) {
				console.error("Error splitting/parsing socket message:", e);
			}
		});

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
}

export default initWebSocketServer;