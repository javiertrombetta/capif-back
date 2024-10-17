import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import TipoActividad from './TipoActividad';
import TipoNavegador from './TipoNavegador';

class LogActividad extends Model {
  public id_log!: string;
  public id_tipo_actividad!: string;
  public fecha!: Date;
  public id_usuario!: string;
  public ip_origen!: string;
  public id_tipo_navegador!: string;
}

LogActividad.init(
  {
    id_log: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.UUID,
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
    id_tipo_actividad: {
      type: DataTypes.UUID,
      references: {
        model: TipoActividad,
        key: 'id_tipo_actividad',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    ip_origen: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [7, 50],
          msg: 'La dirección IP debe tener entre 7 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'La dirección IP no puede estar vacía.',
        },
      },
    },
    id_tipo_navegador: {
      type: DataTypes.UUID,
      references: {
        model: TipoNavegador,
        key: 'id_tipo_navegador',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'LogActividad',
    tableName: 'LogActividad',
    timestamps: true,
  }
);

export default LogActividad;
