import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
} from "sequelize";
import { dbContext } from "~~/Utils/Database";
import { Vehicules } from "./Vehicules";
import { Elements } from "./Elements";

export class Sections extends Model<
    InferAttributes<Sections>,
    InferCreationAttributes<Sections>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare vehicule_id: ForeignKey<Vehicules['id']> | null;
    declare parent_section_id: ForeignKey<Sections['id']> | null;

    // Associations
    declare getVehicule: BelongsToGetAssociationMixin<Vehicules>;
    declare setVehicule: BelongsToSetAssociationMixin<Vehicules, number>;
    declare createVehicule: BelongsToCreateAssociationMixin<Vehicules>;

    declare getParentSection: BelongsToGetAssociationMixin<Sections>;
    declare setParentSection: BelongsToSetAssociationMixin<Sections, number>;
    declare createParentSection: BelongsToCreateAssociationMixin<Sections>;

    declare getSubSections: HasManyGetAssociationsMixin<Sections>;
    declare addSubSection: HasManyAddAssociationMixin<Sections, number>;
    declare createSubSection: HasManyCreateAssociationMixin<Sections>;

    declare getElements: HasManyGetAssociationsMixin<Elements>;
    declare addElement: HasManyAddAssociationMixin<Elements, number>;
    declare createElement: HasManyCreateAssociationMixin<Elements>;

    // Associations inverses
    declare vehicule?: Vehicules;
    declare parentSection?: Sections;
    declare subSections?: Sections[];
    declare elements?: Elements[];
}

Sections.init(
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
        vehicule_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'vehicules',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        parent_section_id: {
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
        tableName: "sections",
        timestamps: false,
        validate: {
            // Validation personnalisée pour s'assurer qu'une section est soit racine (vehicule_id) soit sous-section (parent_section_id)
            rootOrSubSection() {
                if (
                    (this.vehicule_id !== null && this.parent_section_id !== null) ||
                    (this.vehicule_id === null && this.parent_section_id === null)
                ) {
                    throw new Error('Une section doit être soit une section racine (vehicule_id) soit une sous-section (parent_section_id), mais pas les deux ou aucun des deux.');
                }
            }
        }
    }
);

export type TSection = InferAttributes<Sections>;