import { Model, type Sequelize, type InferAttributes, type InferCreationAttributes, type ForeignKey } from "sequelize";
import type { User } from "./user.js";
import type { Post } from "./post.js";
export declare class PostLikes extends Model<InferAttributes<PostLikes>, InferCreationAttributes<PostLikes>> {
    postId: ForeignKey<Post['id']>;
    userId: ForeignKey<User['id']>;
    static initialize(sequelize: Sequelize): void;
    static configureAssociations(): void;
}
//# sourceMappingURL=postlikes.d.ts.map