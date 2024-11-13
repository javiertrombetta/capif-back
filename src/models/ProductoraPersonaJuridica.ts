import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { validateCUIT, validateCBU } from '../services/checkModels';
import Usuario from './Usuario';
import Productora from './Productora';
import UsuarioDocumento from './ProductoraDocumento';

class ProductoraPersonaJuridica extends Model {
  public id_persona_juridica!: string;
  public usuario_registrante_id!: string;
  public productora_id!: string | null;
  public cuit_cuil!: string;
  public razon_social!: string;
  public apellidos_representante!: string;
  public nombres_representante!: string;
  public cuit_representante!: string;
  public denominacion_sello?: string;
  public calle!: string;
  public numero!: string;
  public ciudad!: string;
  public localidad!: string;
  public provincia!: string;
  public codigo_postal!: string;
  public telefono!: string;
  public nacionalidad!: string;
  public cbu?: string;
  public alias_cbu?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public documentos?: UsuarioDocumento[];
  public productora?: Productora;

  public static associations: {
    productora: Association<ProductoraPersonaJuridica, Productora>;
    documentos: Association<ProductoraPersonaJuridica, UsuarioDocumento>;
  };
}

ProductoraPersonaJuridica.init(
  {
    id_persona_juridica: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de persona jurídica debe ser un UUID válido.',
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
    productora_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Productora,
        key: 'id_productora',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora debe ser un UUID válido.',
        },
      },
    },
    cuit_cuil: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: {
          msg: 'El CUIT/CUIL debe contener solo números.',
        },
        isValidCUIT(value: string) {
          const validationResult = validateCUIT(value);
          if (validationResult !== true) {
            throw new Error(validationResult as string);
          }
        },
      },
    },
    razon_social: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    apellidos_representante: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nombres_representante: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cuit_representante: {
      type: DataTypes.CHAR(11),
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: {
          msg: 'El CUIT del representante debe contener solo números.',
        },
        isValidCUIT(value: string) {
          const validationResult = validateCUIT(value);
          if (validationResult !== true) {
            throw new Error(validationResult as string);
          }
        },
      },
    },
    denominacion_sello: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    calle: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    localidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    codigo_postal: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9]+$/,
          msg: 'El teléfono debe contener solo números.',
        },
        notContains: {
          args: '15',
          msg: 'No se debe incluir el 15 para celulares.',
        },
      },
    },
    nacionalidad: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cbu: {
      type: DataTypes.STRING(22),
      allowNull: true,
      validate: {
        isNumeric: {
          msg: 'El CBU debe contener solo números.',
        },
        len: {
          args: [22, 22],
          msg: 'El CBU debe tener exactamente 22 dígitos.',
        },
        isValidCBU(value: string) {
          const validationResult = validateCBU(value);
          if (validationResult !== true) {
            throw new Error(validationResult as string);
          }
        },
      },
    },
    alias_cbu: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [6, 20],
          msg: 'El Alias CBU debe tener entre 6 y 20 caracteres.',
        },
        is: {
          args: /^[a-zA-Z0-9\-_]+$/,
          msg: 'El Alias CBU solo puede contener letras, números, guiones y guiones bajos.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductoraPersonaJuridica',
    tableName: 'ProductoraPersonaJuridica',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_usuario_maestro_registrante_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_persona_juridica_productora_id',
      },
      {
        fields: ['cuit_cuil'],
        name: 'idx_persona_juridica_cuit_cuil',
        unique: true,
      },
      {
        fields: ['razon_social'],
        name: 'idx_persona_juridica_razon_social',
        unique: true,
      },
    ],
  }
);

ProductoraPersonaJuridica.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraPersonaJuridica, {
  foreignKey: 'productora_id',
  as: 'personasJuridicas',
  onDelete: 'SET NULL',
});

ProductoraPersonaJuridica.hasMany(UsuarioDocumento, {
  foreignKey: 'persona_juridica_id',
  as: 'documentos',
  onDelete: 'CASCADE',
});

export default ProductoraPersonaJuridica;
