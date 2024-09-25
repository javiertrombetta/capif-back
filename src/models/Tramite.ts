import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';

class Tramite extends Model {
  public id_tramite!: number;
  public tipo_tramite!: string;
  public id_usuario!: number;
  public estado_id!: number;
}

Tramite.init(
  {
    id_tramite: {
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
    tipo_tramite: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [3, 100],
          msg: 'El tipo de trámite debe tener entre 3 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El tipo de trámite no puede estar vacío.',
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
  },
  {
    sequelize,
    modelName: 'Tramite',
    tableName: 'Tramite',
    timestamps: true,
  }
);

export default Tramite;
