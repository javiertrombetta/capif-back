import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Involucrados from './Involucrados';

class DecisionInvolucrados extends Model {
  public id_decision!: number;
  public decision!: string;
  public fecha_decision!: Date | null;
  public id_involucrado!: number;
}

DecisionInvolucrados.init(
  {
    id_decision: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_involucrado: {
      type: DataTypes.INTEGER,
      references: {
        model: Involucrados,
        key: 'id_involucrado',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del involucrado es obligatorio.',
        },
        isInt: {
          msg: 'El ID del involucrado debe ser un número entero.',
        },
      },
    },
    decision: {
      type: DataTypes.ENUM('aceptado', 'rechazado'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['aceptado', 'rechazado']],
          msg: 'La decisión debe ser "aceptado" o "rechazado".',
        },
      },
    },
    fecha_decision: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de decisión debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'DecisionInvolucrados',
    tableName: 'DecisionInvolucrados',
    timestamps: false,
  }
);

export default DecisionInvolucrados;
