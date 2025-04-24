import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";
import { dbContext } from "~~/Utils/Database";

export class Elements extends Model<
    InferAttributes<Elements>,
    InferCreationAttributes<Elements>
> {
    declare id: CreationOptional<number>;
    declare name: string;
}

Elements.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: dbContext,
        modelName: "elements",
        tableName: "elements",
        timestamps: false,
    }
);

export type TElement = InferAttributes<Elements>;
