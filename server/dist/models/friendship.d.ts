import { Model, type Sequelize, type CreationOptional, type NonAttribute, type ForeignKey } from "sequelize";
import type { User } from "@/models/user.js";
type FriendshipStatus = "pending" | "accepted" | "blocked";
export declare class Friendship extends Model {
    id: CreationOptional<number>;
    requesterId: ForeignKey<number>;
    receiverId: ForeignKey<number>;
    status: CreationOptional<FriendshipStatus>;
    requester?: NonAttribute<User>;
    receiver?: NonAttribute<User>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
export {};
//# sourceMappingURL=friendship.d.ts.map