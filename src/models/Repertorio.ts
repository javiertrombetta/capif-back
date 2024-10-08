import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';
import TipoRepertorio from './TipoRepertorio';

class Repertorio extends Model {
  public id_repertorio!: number;
  public titulo!: string;
  public id_tipo_repertorio!: number;
  public id_usuario!: number;
  public estado_id!: number;
}

Repertorio.init(
  {
    id_repertorio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El título debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El título no puede estar vacío.',
        },
      },
    },
    id_tipo_repertorio: {
      type: DataTypes.UUID,
      references: {
        model: TipoRepertorio,
        key: 'id_tipo_repertorio',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    id_usuario: {
      type: DataTypes.UUID,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      allowNull: false,
      onDelete: 'CASCADE',
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
      type: DataTypes.UUID,
      references: {
        model: Estado,
        key: 'id_estado',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Repertorio',
    tableName: 'Repertorio',
    timestamps: true,
  }
);

export default Repertorio;
