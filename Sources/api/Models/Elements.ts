import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
} from "sequelize";
import { dbContext } from "~~/Utils/Database";

export class Elements extends Model<
    InferAttributes<Elements>,
    InferCreationAttributes<Elements>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare section_id: ForeignKey<number> | null;

    // Associations
    declare getSection: BelongsToGetAssociationMixin<any>;
    declare setSection: BelongsToSetAssociationMixin<any, number>;
    declare createSection: BelongsToCreateAssociationMixin<any>;

    // Association inverse
    declare section?: any;
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
        section_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'sections',
                key: 'id',
            },
            onDelete: 'CASCADE',
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
