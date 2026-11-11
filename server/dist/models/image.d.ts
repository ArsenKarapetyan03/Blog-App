import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from "sequelize";
import { type Post } from "@/models/post.js";
export declare class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
    id: CreationOptional<number>;
    postId: ForeignKey<Post["id"]>;
    imagePath: string;
    post?: NonAttribute<Post>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=image.d.ts.map