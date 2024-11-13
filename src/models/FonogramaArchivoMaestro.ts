import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Fonograma from './Fonograma';
import FonogramaArchivo from './FonogramaArchivo';

class FonogramaArchivoMaestro extends Model {
  public id_fonograma_maestro!: string;
  public fonograma_id!: string;
  public archivo_id!: string;
  public fecha_procesado!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public archivo?: FonogramaArchivo;

  public static associations: {
    fonograma: Association<FonogramaArchivoMaestro, Fonograma>;
    archivo: Association<FonogramaArchivoMaestro, FonogramaArchivo>;
  };
}

FonogramaArchivoMaestro.init(
  {
    id_fonograma_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma maestro debe ser un UUID válido.',
        },
      },
    },
    fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma debe ser un UUID válido.',
        },
      },
    },
    archivo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FonogramaArchivo,
        key: 'id_archivo',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del archivo debe ser un UUID válido.',
        },
      },
    },
    fecha_procesado: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de procesado debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaArchivoMaestro',
    tableName: 'FonogramaArchivoMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_fonograma_maestro_fonograma_id',
      },
      {
        fields: ['archivo_id'],
        name: 'idx_fonograma_maestro_archivo_id',
      },
      {
        fields: ['fecha_procesado'],
        name: 'idx_fonograma_maestro_fecha_procesado',
      },
    ],
  }
);

FonogramaArchivoMaestro.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaArchivoMaestro, {
  foreignKey: 'fonograma_id',
  as: 'archivosMaestros',
  onDelete: 'RESTRICT',
});

FonogramaArchivoMaestro.belongsTo(FonogramaArchivo, {
  foreignKey: 'archivo_id',
  as: 'archivo',
  onDelete: 'RESTRICT',
});

FonogramaArchivo.hasMany(FonogramaArchivoMaestro, {
  foreignKey: 'archivo_id',
  as: 'maestros',
  onDelete: 'RESTRICT',
});

export default FonogramaArchivoMaestro;