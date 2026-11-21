import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { dbContext } from '~~/Utils/Database';

// Relevé kilométrique saisi par un agent à la fin d'une intervention, manœuvre ou autre.
export class VehiculeKilometrages extends Model<
  InferAttributes<VehiculeKilometrages>,
  InferCreationAttributes<VehiculeKilometrages>
> {
  declare id: CreationOptional<number>;
  declare vehicule_id: number;
  declare user_id: number;
  declare kilometrage: number;
  declare motif: string | null;
  declare created_at: CreationOptional<Date>;
}

VehiculeKilometrages.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vehicule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'vehicules', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    kilometrage: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    motif: { type: DataTypes.STRING(200), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize: dbContext, tableName: 'vehicule_kilometrages', timestamps: false }
);
