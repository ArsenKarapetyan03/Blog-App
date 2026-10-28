import { Model, type Sequelize, type CreationOptional } from "sequelize";
type FriendshipStatus = "pending" | "accepted" | "blocked";
export declare class Friendship extends Model {
    id: CreationOptional<number>;
    userId: number;
    friendId: number;
    senderId: number;
    status: CreationOptional<FriendshipStatus>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
export {};
//# sourceMappingURL=friendship.d.ts.map