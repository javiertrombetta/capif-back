import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';

class Consulta extends Model {
  public id_consulta!: string;
  public asunto!: string;
  public mensaje!: string;
  public id_usuario!: string;
  public estado_id!: string;
}

Consulta.init(
  {
    id_consulta: {
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
    estado_id: {
      type: DataTypes.UUID,
      references: {
        model: Estado,
        key: 'id_estado',
      },
      allowNull: true,
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
