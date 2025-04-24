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
    declare number: string;
    declare color: string;
  
    // Association : une garde a un responsable
    declare responsable: ForeignKey<Users['id']>;
  
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
      number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      color: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      responsable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      sequelize: dbContext,
      tableName: 'gardes',
      timestamps: false,
    }
  );
  
  // Associations
  Gardes.belongsTo(Users, {
    foreignKey: 'responsable',
    as: 'responsableUser', // pour accéder à `garde.getResponsableUser()`
  });
  
  Users.hasMany(Gardes, {
    foreignKey: 'responsable',
    as: 'gardesResponsable', // pour accéder à `user.getGardesResponsable()`
  });
  
  Users.belongsTo(Gardes, {
    foreignKey: 'garde_id',
    as: 'garde',
  });

  export type TGarde = InferAttributes<Gardes>;