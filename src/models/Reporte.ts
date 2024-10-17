import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import TipoReporte from './TipoReporte';

class Reporte extends Model {
  public id_reporte!: string;
  public id_tipo_reporte!: string;
  public ruta_archivo!: string;
  public id_usuario!: string;
}

Reporte.init(
  {
    id_reporte: {
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
    id_tipo_reporte: {
      type: DataTypes.UUID,
      references: {
        model: TipoReporte,
        key: 'id_tipo_reporte',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    ruta_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [5, 255],
          msg: 'La ruta del archivo debe tener entre 5 y 255 caracteres.',
        },
        notEmpty: {
          msg: 'La ruta del archivo no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Reporte',
    tableName: 'Reporte',
    timestamps: true,
  }
);

export default Reporte;
