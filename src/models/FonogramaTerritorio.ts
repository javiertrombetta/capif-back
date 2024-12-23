import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class FonogramaTerritorio extends Model {
  public id_territorio!: string;
  public nombre_pais!: string;
  public codigo_iso!: string;
  public is_habilitado!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;  
}

FonogramaTerritorio.init(
  {
    id_territorio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de territorio debe ser un UUID válido.',
        },
      },
    },
    nombre_pais: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'El nombre del país debe tener entre 2 y 100 caracteres.',
        },
      },
    },
    codigo_iso: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[A-Z]{2}$/,
          msg: 'El código ISO debe tener dos letras mayúsculas (ISO 3166-1 alpha-2).',
        },
      },
    },
    is_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FonogramaTerritorio',
    tableName: 'FonogramaTerritorio',
    timestamps: true,
    indexes: [
      {
        fields: ['nombre_pais'],
        name: 'idx_territorio_nombre_pais',
      },
      {
        fields: ['codigo_iso'],
        name: 'idx_territorio_codigo_iso',
        unique: true,
      },
    ],
  }
);

export default FonogramaTerritorio;