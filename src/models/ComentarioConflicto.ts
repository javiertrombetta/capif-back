import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Conflicto from './Conflicto';

class ComentarioConflicto extends Model {
  public id_comentario!: number;
  public comentario!: string;
  public id_conflicto!: number;
  public fecha!: Date;
}

ComentarioConflicto.init(
  {
    id_comentario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El comentario no puede estar vacío.',
        },
      },
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
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ComentarioConflicto',
    tableName: 'ComentarioConflicto',
    timestamps: true,
  }
);

export default ComentarioConflicto;
