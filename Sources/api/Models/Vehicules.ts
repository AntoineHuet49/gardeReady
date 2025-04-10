import { DataTypes } from "sequelize";
import { dbContext } from "~~/Utils/Database";

export const Vehicules = dbContext.define("vehicules", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false,
});
