import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { dbContext } from '~~/Utils/Database';

// Ligne unique (id = 1) : vendredi où la garde de plus petit numéro prend son service.
// Toutes les autres semaines sont déduites par rotation sur les gardes triées par numero.
export class GardeRotation extends Model<
  InferAttributes<GardeRotation>,
  InferCreationAttributes<GardeRotation>
> {
  declare id: number;
  declare reference_date: string; // YYYY-MM-DD, toujours un vendredi
}

GardeRotation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    reference_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize: dbContext,
    tableName: 'garde_rotation',
    timestamps: false,
  }
);
