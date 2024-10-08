import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Compania from './Compania';

class UsuarioAsignado extends Model {
  public id_usuario_asignado!: number;
  public id_usuario!: number;
  public id_compania!: number;
}

UsuarioAsignado.init(
  {
    id_usuario_asignado: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del usuario no puede ser nulo.',
        },
        isInt: {
          msg: 'El ID del usuario debe ser un número entero.',
        },
      },
    },
    id_compania: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Compania,
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de la compañía no puede ser nulo.',
        },
        isInt: {
          msg: 'El ID de la compañía debe ser un número entero.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'UsuarioAsignado',
    tableName: 'UsuarioAsignado',
    timestamps: true,
  }
);

export default UsuarioAsignado;
