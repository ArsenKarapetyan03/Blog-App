import type { AuthenticatedWebSocket } from "@/types/socket.types.js";
export declare const activeUsers: Map<number, Set<AuthenticatedWebSocket>>;
export declare const broadcastToUser: (userId: number, data: any) => void;
//# sourceMappingURL=active-users.d.ts.map