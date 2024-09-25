import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class AuditoriaCambio extends Model {
  public id_auditoria!: number;
  public tabla_afectada!: string;
  public operacion!: string;
  public descripcion!: string;
  public fecha!: Date;
  public id_usuario!: number;
}

AuditoriaCambio.init(
  {
    id_auditoria: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    tabla_afectada: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'El nombre de la tabla afectada debe tener entre 1 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'La tabla afectada no puede estar vacía.',
        },
      },
    },
    operacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [1, 50],
          msg: 'El tipo de operación debe tener entre 1 y 50 caracteres.',
        },
        notEmpty: {
          msg: 'La operación no puede estar vacía.',
        },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'AuditoriaCambio',
    tableName: 'AuditoriaCambio',
    timestamps: true,
  }
);

export default AuditoriaCambio;
