import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { validateCUIT, validateCBU } from '../services/checkModels';
import Usuario from './Usuario';
import PersonaFisica from './ProductoraPersonaFisica';
import PersonaJuridica from './ProductoraPersonaJuridica';
import ProductoraISRC from './ProductoraISRCTipo';
import Cashflow from './Cashflow';

class Productora extends Model {
  public id_productora!: string;
  public usuario_principal_id!: string | null;
  public persona_fisica_id?: string | null;
  public persona_juridica_id?: string | null;
  public nombre_productora!: string;
  public cuit_productora!: string;
  public cbu_productora!: string;
  public alias_cbu_productora!: string;
  public isrc_productora!: string | null;
  public fecha_ultimo_fonograma!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioPrincipal?: Usuario;

  public static associations: {
    usuarioPrincipal: Association<Productora, Usuario>;
  };
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
          msg: 'El ID de la productora debe ser un UUID válido.',
        },
      },
    },
    usuario_principal_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario principal debe ser un UUID válido.',
        },
      },
    },
    persona_fisica_id: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la persona física debe ser un UUID válido.',
        },
      },
    },
    persona_juridica_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: PersonaJuridica,
        key: 'id_persona_juridica',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la persona jurídica debe ser un UUID válido.',
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
    cuit_productora: {
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
    cbu_productora: {
      type: DataTypes.STRING(22),
      allowNull: true,
      validate: {
        isNumeric: {
          msg: 'El CBU de la productora debe contener solo números.',
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
    alias_cbu_productora: {
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
    isrc_productora: {
      type: DataTypes.STRING(3),
      allowNull: true,
      validate: {
        isAlphanumeric: {
          msg: 'El código ISRC de la productora debe ser alfanumérico.',
        },
        len: {
          args: [3, 3],
          msg: 'El código ISRC debe tener exactamente 3 caracteres.',
        },
      },
    },
    fecha_ultimo_fonograma: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha del último fonograma debe ser una fecha válida.',
        },
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
        fields: ['usuario_principal_id'],
        name: 'idx_productora_usuario_principal_id',
      },      
      {
        fields: ['nombre_productora'],
        name: 'idx_productora_nombre_productora',
      },
      {
        fields: ['cuit_productora'],
        name: 'idx_productora_cuit_productora',
      },
      {
        fields: ['cbu_productora'],
        name: 'idx_productora_cbu_productora',
      },
      {
        fields: ['alias_cbu_productora'],
        name: 'idx_productora_alias_cbu_productora',
      },
      {
        fields: ['isrc_productora'],
        name: 'idx_productora_isrc_productora',
      },
      {
        unique: true,
        fields: ['nombre_productora', 'cuit_productora'],
        name: 'unique_productora_nombre_cuit',
      },
    ],
  }
);

// Generación de código único de 3 caracteres para isrc_productora
Productora.beforeCreate(async (productora) => {
  const availableCode = await ProductoraISRC.findOne({
    where: { in_use: false },
  });

  if (availableCode) {
    productora.isrc_productora = availableCode.codigo;
    await availableCode.update({ in_use: true });
  } else {
    throw new Error('No hay códigos ISRC disponibles');
  }
});

// Crear también un Cashflow asociado a la productora
Productora.afterCreate(async (productora, options) => {
  try {
    await Cashflow.create(
      {
        productora_id: productora.id_productora,
        usuario_registrante_id: productora.usuario_principal_id,
        saldo_actual_productora: 0.0,
      },
      { transaction: options.transaction }
    );
  } catch (error) {
    console.error('Error al crear el Cashflow asociado:', error);
  }
});

Productora.belongsTo(Usuario, {
  foreignKey: 'usuario_principal_id',
  as: 'usuarioPrincipal',
  onDelete: 'CASCADE',
});

Usuario.hasOne(Productora, {
  foreignKey: 'usuario_principal_id',
  as: 'productora',
  onDelete: 'CASCADE',
});

Productora.belongsTo(PersonaFisica, {
  foreignKey: 'persona_fisica_id',
  as: 'personaFisica',
  onDelete: 'SET NULL',
});

PersonaFisica.hasOne(Productora, {
  foreignKey: 'persona_fisica_id',
  as: 'productora',
  onDelete: 'SET NULL',
});

Productora.belongsTo(PersonaJuridica, {
  foreignKey: 'persona_juridica_id',
  as: 'personaJuridica',
  onDelete: 'SET NULL',
});

PersonaJuridica.hasOne(Productora, {
  foreignKey: 'persona_juridica_id',
  as: 'productora',
  onDelete: 'SET NULL',
});

export default Productora;
