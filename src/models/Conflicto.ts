import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Estado from './Estado';
import TipoConflicto from './TipoConflicto';

class Conflicto extends Model {
  public id_conflicto!: number;
  public id_tipo_conflicto!: number;
  public descripcion!: string;
  public id_fonograma!: number;
  public estado_id!: number;
  public fecha_resolucion!: Date | null;
}

Conflicto.init(
  {
    id_conflicto: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_fonograma: {
      type: DataTypes.INTEGER,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del fonograma es obligatorio.',
        },
        isInt: {
          msg: 'El ID del fonograma debe ser un número entero.',
        },
      },
    },
    id_tipo_conflicto: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoConflicto,
        key: 'id_tipo_conflicto',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Estado,
        key: 'id_estado',
      },
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de resolución debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Conflicto',
    tableName: 'Conflicto',
    timestamps: true,
  }
);

export default Conflicto;
