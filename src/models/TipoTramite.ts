import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoTramite extends Model {
  public id_tipo_tramite!: string;
  public descripcion!: string;
}

TipoTramite.init(
  {
    id_tipo_tramite: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [3, 100],
          msg: 'La descripción debe tener entre 3 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoTramite',
    tableName: 'TipoTramite',
    timestamps: true,
  }
);

export default TipoTramite;
