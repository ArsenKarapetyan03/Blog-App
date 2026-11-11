import { Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type Sequelize, type NonAttribute } from "sequelize";
import type { Message } from "@/models/message.js";
import type { User } from "@/models/user.js";
export declare class Chat extends Model<InferAttributes<Chat, {
    omit: "messages" | "users" | "memberships";
}>, InferCreationAttributes<Chat, {
    omit: "messages" | "users" | "memberships";
}>> {
    id: CreationOptional<number>;
    title: string | null;
    isGroup: CreationOptional<boolean>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
    users?: NonAttribute<User[]>;
    messages?: NonAttribute<Message[]>;
    memberships?: NonAttribute<any[]>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=chat.d.ts.map