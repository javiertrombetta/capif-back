import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Estado from './Estado';

class Conflicto extends Model {
  public id_conflicto!: number;
  public tipo_conflicto!: string;
  public descripcion!: string;
  public id_fonograma!: number;
  public estado_id!: number;
  public fecha_creacion!: Date;
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
    tipo_conflicto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'El tipo de conflicto debe tener entre 3 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El tipo de conflicto no puede estar vacío.',
        },
      },
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
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de creación debe ser una fecha válida.',
        },
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
    timestamps: false,
  }
);

export default Conflicto;
