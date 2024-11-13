import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Usuario from './Usuario';
import Pais from './FonogramaPaisTipo';

class FonogramaTerritorialidad extends Model {
  public id_territorialidad!: string;
  public fonograma_id!: string;
  public usuario_registrante_id!: string;
  public territorialidad_pais_id!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public usuarioRegistrante?: Usuario;
  public paisTerritorialidad?: Pais;

  public static associations: {
    fonograma: Association<FonogramaTerritorialidad, Fonograma>;
    usuarioRegistrante: Association<FonogramaTerritorialidad, Usuario>;
    paisTerritorialidad: Association<FonogramaTerritorialidad, Pais>;
  };
}

FonogramaTerritorialidad.init(
  {
    id_territorialidad: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de territorialidad debe ser un UUID válido.',
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
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
        },
      },
    },
    territorialidad_pais_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Pais,
        key: 'id_pais',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del país de territorialidad debe ser un UUID válido.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaTerritorialidad',
    tableName: 'FonogramaTerritorialidad',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_territorialidad_fonograma_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_territorialidad_usuario_registrante_id',
      },
      {
        fields: ['territorialidad_pais_id'],
        name: 'idx_territorialidad_pais_id',
      },
    ],
  }
);

FonogramaTerritorialidad.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaTerritorialidad, {
  foreignKey: 'fonograma_id',
  as: 'territorialidades',
  onDelete: 'RESTRICT',
});

FonogramaTerritorialidad.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaTerritorialidad, {
  foreignKey: 'usuario_registrante_id',
  as: 'territorialidadesRegistradas',
  onDelete: 'SET NULL',
});

FonogramaTerritorialidad.belongsTo(Pais, {
  foreignKey: 'territorialidad_pais_id',
  as: 'paisTerritorialidad',
  onDelete: 'RESTRICT',
});

Pais.hasMany(FonogramaTerritorialidad, {
  foreignKey: 'territorialidad_pais_id',
  as: 'territorialidades',
  onDelete: 'RESTRICT',
});

export default FonogramaTerritorialidad;
