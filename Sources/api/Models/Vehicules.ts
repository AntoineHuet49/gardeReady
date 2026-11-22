import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { dbContext } from "~~/Utils/Database";

export class Vehicules extends Model<
    InferAttributes<Vehicules>,
    InferCreationAttributes<Vehicules>
> {
    declare id: CreationOptional<number>;
    declare name: string;
}

Vehicules.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize: dbContext,
        tableName: "vehicules",
        timestamps: false,
    }
);

export type TVehicules = InferAttributes<Vehicules>;
