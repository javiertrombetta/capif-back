import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Conflicto from './Conflicto';
import Compania from './Compania';

class Involucrados extends Model {
  public id_involucrado!: string;
  public id_conflicto!: string;
  public id_titular!: string;
}

Involucrados.init(
  {
    id_involucrado: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_conflicto: {
      type: DataTypes.UUID,
      references: {
        model: Conflicto,
        key: 'id_conflicto',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del conflicto es obligatorio.',
        },
        isInt: {
          msg: 'El ID del conflicto debe ser un número entero.',
        },
      },
    },
    id_titular: {
      type: DataTypes.UUID,
      references: {
        model: Compania,
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del titular es obligatorio.',
        },
        isInt: {
          msg: 'El ID del titular debe ser un número entero.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Involucrados',
    tableName: 'Involucrados',
    timestamps: true,
  }
);

export default Involucrados;
