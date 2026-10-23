export declare const userService: {
    findByEmail: (email: string) => Promise<import("../models/user.js").User | null>;
    findById: (id: number | string) => Promise<import("../models/user.js").User | null>;
    createUser: (userData: any) => Promise<import("../models/user.js").User>;
};
//# sourceMappingURL=user.service.d.ts.map