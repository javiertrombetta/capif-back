import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Compania from './Compania';

class PostulacionPremio extends Model {
  public id_postulacion!: number;
  public id_compania!: number;
  public id_usuario!: number;
  public codigo_postulacion!: string;
  public fecha_asignacion!: Date;
}

PostulacionPremio.init(
  {
    id_postulacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_compania: {
      type: DataTypes.INTEGER,
      references: {
        model: Compania,
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de la compañía es obligatorio.',
        },
        isInt: {
          msg: 'El ID de la compañía debe ser un número entero.',
        },
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del usuario es obligatorio.',
        },
        isInt: {
          msg: 'El ID del usuario debe ser un número entero.',
        },
      },
    },
    codigo_postulacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'El código de postulación debe tener entre 1 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'El código de postulación no puede estar vacío.',
        },
      },
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de asignación debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'PostulacionPremio',
    tableName: 'PostulacionPremio',
    timestamps: true,
  }
);

export default PostulacionPremio;
