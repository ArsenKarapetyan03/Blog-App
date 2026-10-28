export declare const friendshipService: {
    find: (userId: number, friendId: number) => Promise<import("../models/friendship.js").Friendship | null>;
    create: (userId: number, friendId: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    updateStatus: (userId: number, friendId: number, status: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    delete: (userId: number, friendId: number) => Promise<{
        success: boolean;
        message: string;
    }>;
};
//# sourceMappingURL=friendship.service.d.ts.map