import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
  } from 'sequelize';
  import { dbContext } from '~~/Utils/Database';
  import { Users } from './Users';
  
export class Gardes extends Model<
  InferAttributes<Gardes>,
  InferCreationAttributes<Gardes>
> {
  declare id: CreationOptional<number>;
  declare numero: number;
  declare color: string;

  // Association : une garde peut avoir un responsable (optionnel)
  declare responsable: CreationOptional<ForeignKey<Users['id']>>;

  // Association inverse : une garde a plusieurs utilisateurs
  declare users?: Users[];
}

Gardes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    responsable: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optionnel : une garde peut être créée sans responsable
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize: dbContext,
    tableName: 'gardes',
    timestamps: false,
  }
);

  export type TGarde = InferAttributes<Gardes>;