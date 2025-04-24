import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { dbContext } from "~~/Utils/Database";

export class Users extends Model<
  InferAttributes<Users>,
  InferCreationAttributes<Users>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;
  declare firstname: string;
  declare lastname: string;
  declare garde_id: number;
}

Users.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        garde_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "gardes",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        defaultScope: {
          attributes: { exclude: ["password"] },  
        },
        scopes: {
          withPassword: {
            attributes: { include: ["password"] },
          },
        },
        sequelize: dbContext,
        tableName: "users",
        timestamps: false,
    }
);

export type TUserWithPassword = InferAttributes<Users>;
