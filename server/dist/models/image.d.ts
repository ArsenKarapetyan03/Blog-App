import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from "sequelize";
import { type Post } from "@/models/post.js";
export declare class Image extends Model<InferAttributes<Image>, InferCreationAttributes<Image>> {
    id: CreationOptional<number>;
    postId: ForeignKey<Post["id"]>;
    imagePath: string;
    post?: NonAttribute<Post>;
    static associate(models: {
        Post: typeof Post;
    }): void;
}
export declare function initImage(sequelize: Sequelize): typeof Image;
//# sourceMappingURL=image.d.ts.map