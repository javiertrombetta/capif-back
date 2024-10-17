import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Estado from './Estado';
import TipoConflicto from './TipoConflicto';

class Conflicto extends Model {
  public id_conflicto!: string;
  public id_tipo_conflicto!: string;
  public descripcion!: string;
  public id_fonograma!: string;
  public estado_id!: string;
  public fecha_resolucion!: Date | null;
}

Conflicto.init(
  {
    id_conflicto: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_fonograma: {
      type: DataTypes.UUID,
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
      type: DataTypes.UUID,
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
      type: DataTypes.UUID,
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
