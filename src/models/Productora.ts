import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { validateCUIT, validateCBU } from '../utils/checkModels';

const TIPO_PERSONA = ['FISICA', 'JURIDICA'] as const;

class Productora extends Model {
  public id_productora!: string;
  public nombre_productora!: string;
  public tipo_persona!: (typeof TIPO_PERSONA)[number];
  public cuit_cuil!: string;
  public email!: string;
  public calle!: string;
  public numero!: string;
  public ciudad!: string;
  public localidad!: string;
  public provincia!: string;
  public codigo_postal!: string;
  public telefono!: string;
  public nacionalidad!: string;
  public alias_cbu!: string;
  public cbu!: string;
  public cantidad_fonogramas!: number;
  public denominacion_sello!: string | null;
  public datos_adicionales!: string | null;  
  public fecha_alta!: Date | null;
  public fecha_ultimo_fonograma!: Date | null;  

  // Campos específicos para Persona Física
  public nombres!: string | null;
  public apellidos!: string | null;

  // Campos específicos para Persona Jurídica
  public razon_social!: string | null;
  public apellidos_representante!: string | null;
  public nombres_representante!: string | null;
  public cuit_representante!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date; 
}

Productora.init(
  {
    id_productora: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de Productora Datos debe ser un UUID válido.',
        },
      },
    },
    nombre_productora: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'El nombre de la productora debe tener entre 3 y 255 caracteres.',
        },
      },
    },
    tipo_persona: {
      type: DataTypes.ENUM(...TIPO_PERSONA),
      allowNull: false,
      validate: {
        isIn: {
          args: [TIPO_PERSONA],
          msg: 'El tipo de persona debe ser FISICA o JURIDICA.',
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
        // isValidCUIT(value: string) {
        //   const validationResult = validateCUIT(value);
        //   if (validationResult !== true) {
        //     throw new Error(validationResult as string);
        //   }
        // },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'El email debe ser válido.',
        },
      },
    },
    calle: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    localidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    codigo_postal: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]+$/,
          msg: 'El teléfono debe contener solo números.',
        },
      },
    },
    nacionalidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    cbu: {
      type: DataTypes.STRING(22),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: {
          msg: 'El CBU debe contener solo números.',
        },
        len: {
          args: [22, 22],
          msg: 'El CBU debe tener exactamente 22 dígitos.',
        },
        // isValidCBU(value: string) {
        //   const validationResult = validateCBU(value);
        //   if (validationResult !== true) {
        //     throw new Error(validationResult as string);
        //   }
        // },
      },
    },
    cantidad_fonogramas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'La cantidad de fonogramas no puede ser negativa.',
        },
      },
    },
    denominacion_sello: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    datos_adicionales: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fecha_alta: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de alta definitiva debe ser una fecha válida.',
        },
      },
    },
    fecha_ultimo_fonograma: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de del último fonograma registrado debe ser una fecha válida.',
        },
      },
    },
    
    // Campos específicos para Persona Física
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Campos específicos para Persona Jurídica
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
        // isValidCUIT(value: string | null) {
        //   if (value === null || value === undefined) return;
        //   const validationResult = validateCUIT(value);
        //   if (validationResult !== true) {
        //     throw new Error(validationResult as string);
        //   }
        // },
      },
    },
  },
  {
    sequelize,
    modelName: 'Productora',
    tableName: 'Productora',
    timestamps: true,
    indexes: [
      {
        fields: ['nombre_productora'],
        name: 'idx_productora_nombre_productora',
      },
      {
        fields: ['tipo_persona'],
        name: 'idx_productora_tipo_persona',
      },
      {
        fields: ['cuit_cuil'],
        name: 'idx_productora_datos_cuit_cuil',
        unique: true,
      },
      {
        fields: ['email'],
        name: 'idx_productora_datos_email',
        unique: true,
      },
      {
        fields: ['alias_cbu'],
        name: 'idx_productora_datos_alias_cbu',
        unique: true,
      },
      {
        fields: ['cbu'],
        name: 'idx_productora_datos_cbu',
        unique: true,
      },
      {
        fields: ['nombre_productora', 'cuit_cuil'],
        unique: true,
        name: 'unique_productora_nombre_cuit',
      },
    ],
  }
);

Productora.beforeUpdate(async (productora) => {
  if (productora.changed("tipo_persona")) {
    if (productora.tipo_persona === "FISICA") {
      // Si se cambia a FISICA, limpiar los campos de JURIDICA
      productora.razon_social = null;
      productora.nombres_representante = null;
      productora.apellidos_representante = null;
      productora.cuit_representante = null;
    } else if (productora.tipo_persona === "JURIDICA") {
      // Si se cambia a JURIDICA, limpiar los campos de FISICA
      productora.nombres = null;
      productora.apellidos = null;
    }
  }
});

export default Productora;
