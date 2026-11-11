import type { AuthenticatedWebSocket } from "@/types/socket.types.js";
type WsHandler = (ws: AuthenticatedWebSocket, rawData: any) => Promise<void>;
export declare const catchAsyncWs: (handler: WsHandler) => (ws: AuthenticatedWebSocket, rawData: any) => Promise<void>;
export {};
//# sourceMappingURL=ws.error.d.ts.map