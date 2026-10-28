export declare const userService: {
    findAll: () => Promise<import("../models/user.js").User[]>;
    findByEmail: (email: string) => Promise<import("../models/user.js").User | null>;
    findById: (id: number) => Promise<import("../models/user.js").User | null>;
    findPendingRequests: (userId: number) => Promise<{
        incomingRequests: (import("../models/user.js").User | undefined)[];
        outgoingRequests: (import("../models/user.js").User | undefined)[];
    }>;
    createUser: (userData: any) => Promise<import("../models/user.js").User>;
};
//# sourceMappingURL=user.service.d.ts.map