import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Sesion extends Model {
  public id_sesion!: string;
  public fecha_inicio!: Date;
  public fecha_fin!: Date | null;
  public id_usuario!: string;
  public ip!: string;
}

Sesion.init(
  {
    id_sesion: {
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
    fecha_inicio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de inicio debe ser una fecha válida.',
        },
      },
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de fin debe ser una fecha válida.',
        },
      },
    },
    ip: {
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
  },
  {
    sequelize,
    modelName: 'Sesion',
    tableName: 'Sesion',
    timestamps: true,
  }
);

export default Sesion;
