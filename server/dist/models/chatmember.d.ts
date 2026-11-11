import { Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type Sequelize, type ForeignKey } from "sequelize";
export declare class ChatMember extends Model<InferAttributes<ChatMember>, InferCreationAttributes<ChatMember>> {
    id: CreationOptional<number>;
    chatId: ForeignKey<number>;
    userId: ForeignKey<number>;
    role: CreationOptional<string>;
    lastReadAt: CreationOptional<Date | null>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=chatmember.d.ts.map