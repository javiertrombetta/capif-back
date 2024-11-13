import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

class FonogramaTerritorialidadPais extends Model {
  public id_territorialidad_pais!: string;
  public nombre_pais!: string;
  public codigo_iso!: string;
  public is_activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;  
}

FonogramaTerritorialidadPais.init(
  {
    id_territorialidad_pais: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de territorialidad del país debe ser un UUID válido.',
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
    is_activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FonogramaTerritorialidadPais',
    tableName: 'FonogramaTerritorialidadPais',
    timestamps: true,
    indexes: [
      {
        fields: ['codigo_iso'],
        name: 'idx_territorialidad_codigo_iso',
        unique: true,
      },
      {
        fields: ['is_activo'],
        name: 'idx_territorialidad_is_activo',
      },
    ],
  }
);

FonogramaTerritorialidadPais.hasMany(Fonograma, {
  foreignKey: 'territorialidad_id',
  as: 'fonogramas',
  onDelete: 'SET NULL',
});

Fonograma.belongsTo(FonogramaTerritorialidadPais, {
  foreignKey: 'territorialidad_id',
  as: 'territorialidad',
  onDelete: 'SET NULL',
});

export default FonogramaTerritorialidadPais;