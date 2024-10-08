import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Involucrados from './Involucrados';
import TipoDecision from './TipoDecision';

class DecisionInvolucrados extends Model {
  public id_decision!: number;
  public id_tipo_decision!: number;
  public fecha_decision!: Date | null;
  public id_involucrado!: number;
}

DecisionInvolucrados.init(
  {
    id_decision: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_involucrado: {
      type: DataTypes.UUID,
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
    id_tipo_decision: {
      type: DataTypes.UUID,
      references: {
        model: TipoDecision,
        key: 'id_tipo_decision',
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El tipo de decisión es obligatorio.',
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
    timestamps: true,
  }
);

export default DecisionInvolucrados;
