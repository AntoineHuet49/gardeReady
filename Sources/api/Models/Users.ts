import { DataTypes, InferAttributes, Model } from "sequelize";
import { dbContext } from "~~/Utils/Database";

export class Users extends Model {}

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
            allowNull: true,
            references: {
                model: "gardes",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize: dbContext,
        tableName: "users",
        timestamps: false,
    }
);

export type TUser = InferAttributes<Users>;
