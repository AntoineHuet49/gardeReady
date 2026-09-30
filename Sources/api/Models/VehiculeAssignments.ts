import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { dbContext } from '~~/Utils/Database';

// Agent chargé de vérifier un véhicule à la prise de garde d'une semaine donnée.
// La garde n'est pas stockée : elle se déduit de shift_date par la rotation (Utils/GardeRotation.ts).
export class VehiculeAssignments extends Model<
  InferAttributes<VehiculeAssignments>,
  InferCreationAttributes<VehiculeAssignments>
> {
  declare id: CreationOptional<number>;
  declare shift_date: string; // AAAA-MM-JJ, vendredi de relève
  declare vehicule_id: number;
  declare user_id: number;
}

VehiculeAssignments.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shift_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
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
  },
  {
    sequelize: dbContext,
    tableName: 'vehicule_assignments',
    timestamps: false,
    indexes: [{ unique: true, fields: ['shift_date', 'vehicule_id', 'user_id'] }],
  }
);
