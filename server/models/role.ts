import {
  Model,
  DataTypes,
  type Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from "sequelize";
import type { ChatMember } from "./chatmember.js";

export type RoleName = "admin" | "member";

export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare members?: NonAttribute<ChatMember[]>;

  private static roleCache = new Map<string, number>();

  static async getId(name: RoleName): Promise<number> {
    const cachedId = this.roleCache.get(name);
    if (cachedId) {
      return cachedId;
    }

    const [role] = await this.findOrCreate({
      where: { name },
      defaults: { name }
    });

    this.roleCache.set(name, role.id);
    return role.id;
  }


  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "Role",
        timestamps: false,
      }
    );
  }

  static configureAssociations() {
    const registry = this.sequelize!.models;

    this.hasMany(registry.ChatMember as any, {
      foreignKey: "roleId",
      as: "members",
    });
  }
}
