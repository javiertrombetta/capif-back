import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Usuario from './Usuario';
import UsuarioProductora from './Productora';

class FonogramaISRC extends Model {
  public id_isrc!: string;
  public fonograma_id!: string;
  public productora_id!: string;
  public usuario_registrante_id!: string;
  public codigo_pais!: string;
  public codigo_productora!: string;
  public codigo_anioRegistro!: string;
  public codigo_designacion!: string;
  public codigo_isrc!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public usuarioRegistrante?: Usuario;
  public productora?: UsuarioProductora;

  public static associations: {
    fonograma: Association<FonogramaISRC, Fonograma>;
    usuarioRegistrante: Association<FonogramaISRC, Usuario>;
    productora: Association<FonogramaISRC, UsuarioProductora>;
  };
}

FonogramaISRC.init(
  {
    id_isrc: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del ISRC debe ser un UUID válido.',
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
    productora_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UsuarioProductora,
        key: 'id_productora',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora debe ser un UUID válido.',
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
    codigo_pais: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'AR',
      validate: {
        is: {
          args: /^[A-Z]{2}$/,
          msg: 'El código de país debe tener dos letras mayúsculas (ISO 3166-1 alpha-2).',
        },
      },
    },
    codigo_productora: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        isAlphanumeric: {
          msg: 'El código de productora debe ser alfanumérico.',
        },
        len: {
          args: [3, 3],
          msg: 'El código de productora debe tener exactamente 3 caracteres.',
        },
      },
    },
    codigo_anioRegistro: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El código de año de registro debe contener solo números.',
        },
        len: {
          args: [2, 2],
          msg: 'El código de año de registro debe tener exactamente 2 dígitos.',
        },
      },
    },
    codigo_designacion: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El código de designación debe contener solo números.',
        },
        len: {
          args: [5, 5],
          msg: 'El código de designación debe tener exactamente 5 dígitos.',
        },
      },
    },
    codigo_isrc: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[A-Z]{2}[0-9A-Z]{3}[0-9]{2}[0-9]{5}$/,
          msg: 'El código ISRC debe seguir el formato correcto (Ej: ARABC2100001).',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaISRC',
    tableName: 'FonogramaISRC',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_isrc_fonograma_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_isrc_productora_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_isrc_usuario_registrante_id',
      },
      {
        fields: ['codigo_isrc'],
        name: 'idx_isrc_codigo_isrc',
        unique: true,
      },
    ],
  }
);

FonogramaISRC.beforeValidate((fonogramaISRC) => {
  if (
    fonogramaISRC.codigo_pais &&
    fonogramaISRC.codigo_productora &&
    fonogramaISRC.codigo_anioRegistro &&
    fonogramaISRC.codigo_designacion
  ) {
    fonogramaISRC.codigo_isrc = `${fonogramaISRC.codigo_pais}${fonogramaISRC.codigo_productora}${fonogramaISRC.codigo_anioRegistro}${fonogramaISRC.codigo_designacion}`;
  }
});

FonogramaISRC.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaISRC, {
  foreignKey: 'fonograma_id',
  as: 'isrcs',
  onDelete: 'RESTRICT',
});

FonogramaISRC.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaISRC, {
  foreignKey: 'usuario_registrante_id',
  as: 'isrcRegistrados',
  onDelete: 'SET NULL',
});

FonogramaISRC.belongsTo(UsuarioProductora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

UsuarioProductora.hasMany(FonogramaISRC, {
  foreignKey: 'productora_id',
  as: 'isrcsRegistrados',
  onDelete: 'RESTRICT',
});

export default FonogramaISRC;
