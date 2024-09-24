import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';

class Consulta extends Model {
  public id_consulta!: number;
  public asunto!: string;
  public mensaje!: string;
  public id_usuario!: number;
  public estado_id!: number;
  public fecha_envio!: Date;
}

Consulta.init(
  {
    id_consulta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    asunto: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [5, 150],
          msg: 'El asunto debe tener entre 5 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El asunto no puede estar vacío.',
        },
      },
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        notEmpty: {
          msg: 'El mensaje no puede estar vacío.',
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
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Estado,
        key: 'id_estado',
      },
      allowNull: true,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de envío debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Consulta',
    tableName: 'Consulta',
    timestamps: true,
  }
);

export default Consulta;
