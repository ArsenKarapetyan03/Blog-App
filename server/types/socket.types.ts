import { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
	user?: {
		id: number;
		email: string;
	};
}
