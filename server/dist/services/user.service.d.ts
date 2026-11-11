import type { User } from "@/models/user.js";
interface PendingRequestsResult {
    incomingRequests: User[];
    outgoingRequests: User[];
}
export declare const userService: {
    findAll: (searchString: string, limit: number, offset: number, currentUserId: number | undefined) => Promise<{
        rows: User[];
        count: number;
    }>;
    findByEmail: (email: string) => Promise<User | null>;
    findById: (id: number) => Promise<User | null>;
    findPendingRequests: (userId: number) => Promise<PendingRequestsResult>;
    createUser: (userData: any) => Promise<User>;
};
export {};
//# sourceMappingURL=user.service.d.ts.map