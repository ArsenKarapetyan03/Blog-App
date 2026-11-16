import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type Sequelize,
  type ForeignKey,
  type NonAttribute,
} from "sequelize";
import type { Role, RoleName } from "@/models/role.js";

export class ChatMember extends Model<
  InferAttributes<ChatMember>,
  InferCreationAttributes<ChatMember>
> {
  declare id: CreationOptional<number>;
  declare chatId: ForeignKey<number>;
  declare userId: ForeignKey<number>;
  declare roleId: CreationOptional<ForeignKey<number>>;
  declare lastReadAt: CreationOptional<Date | null>;

  declare role?: CreationOptional<RoleName>;
  declare roleDetails?: NonAttribute<Role>;

  get isAdmin(): NonAttribute<boolean> {
    return this.roleDetails?.name === "admin";
  }

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        chatId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Roles",
            key: "id",
          },
        },
        lastReadAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
        role: {
          type: DataTypes.VIRTUAL,
        },
      },
      {
        sequelize,
        modelName: "ChatMember",
        indexes: [
          {
            unique: true,
            fields: ["chatId", "userId"],
          },
        ],
        hooks: {
          beforeValidate: async (member) => {
            if (member.role && !member.roleId) {
              const RoleModel = sequelize.models.Role as typeof Role;
              member.roleId = await RoleModel.getId(member.role);
            }
          },
          beforeBulkCreate: async (members) => {
            const RoleModel = sequelize.models.Role as typeof Role;
            for (const member of members) {
              if (member.role && !member.roleId) {
                member.roleId = await RoleModel.getId(member.role);
              }
            }
          },
        },
      }
    );
  }

  static configureAssociations(): void {
    const registry = this.sequelize!.models;

    this.belongsTo(registry.Chat as any, {
      foreignKey: "chatId",
      as: "chat",
    });

    this.belongsTo(registry.User as any, {
      foreignKey: "userId",
      as: "user",
    });

    this.belongsTo(registry.Role as any, {
      foreignKey: "roleId",
      as: "roleDetails",
      onDelete: "RESTRICT",
    });
  }
}
