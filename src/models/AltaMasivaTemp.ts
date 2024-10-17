import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Repertorio from './Repertorio';

class AltaMasivaTemp extends Model {
  public id_temporal!: string;
  public id_usuario!: string;
  public id_repertorio!: string;
  public procesado!: boolean;
}

AltaMasivaTemp.init(
  {
    id_temporal: {
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
    id_repertorio: {
      type: DataTypes.UUID,
      references: {
        model: Repertorio,
        key: 'id_repertorio',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del repertorio es obligatorio.',
        },
        isInt: {
          msg: 'El ID del repertorio debe ser un número entero.',
        },
      },
    },
    procesado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: 'El valor de "procesado" debe ser booleano.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'AltaMasivaTemp',
    tableName: 'AltaMasivaTemp',
    timestamps: true,
  }
);

export default AltaMasivaTemp;
