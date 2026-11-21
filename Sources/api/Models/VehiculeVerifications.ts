import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { dbContext } from '~~/Utils/Database';

export type VerificationResult = { element: string; status: string; comment: string };

// Historique des vérifications envoyées : `results` est un instantané des lignes du rapport PDF.
export class VehiculeVerifications extends Model<
  InferAttributes<VehiculeVerifications>,
  InferCreationAttributes<VehiculeVerifications>
> {
  declare id: CreationOptional<number>;
  declare vehicule_id: number;
  declare user_id: number;
  declare garde_id: number | null; // garde de l'agent au moment de la vérification
  declare results: VerificationResult[];
  declare created_at: CreationOptional<Date>;
}

VehiculeVerifications.init(
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
    garde_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'gardes', key: 'id' },
      onDelete: 'SET NULL',
    },
    results: { type: DataTypes.JSONB, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize: dbContext,
    tableName: 'vehicule_verifications',
    timestamps: false,
  }
);
