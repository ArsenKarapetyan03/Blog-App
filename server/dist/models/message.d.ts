import { Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type Sequelize, type ForeignKey, type NonAttribute } from "sequelize";
import type { User } from "@/models/user.js";
export declare class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
    id: CreationOptional<number>;
    senderId: ForeignKey<number>;
    chatId: ForeignKey<number>;
    messageText: string;
    isRead: CreationOptional<boolean>;
    isDeleted: CreationOptional<boolean>;
    createdAt: CreationOptional<Date>;
    updatedAt: CreationOptional<Date>;
    sender: NonAttribute<User>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=message.d.ts.map