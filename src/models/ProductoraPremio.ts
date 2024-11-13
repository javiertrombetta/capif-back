import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Productora from './Productora';

class ProductoraPremio extends Model {
  public id_premio!: string;
  public productora_id!: string;
  public usuario_registrante_id!: string;
  public codigo_postulacion!: string;
  public fecha_asignacion!: Date;
  public fecha_cierre!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuario?: Usuario;
  public productora?: Productora;

  public static associations: {
    usuario: Association<ProductoraPremio, Usuario>;
    productora: Association<ProductoraPremio, Productora>;
  };
}

ProductoraPremio.init(
  {
    id_premio: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del premio debe ser un UUID válido.',
        },
      },
    },
    productora_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
          msg: 'El ID del usuario debe ser un UUID válido.',
        },
      },
    },
    codigo_postulacion: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: 'El código de postulación debe ser alfanumérico.',
        },
        len: {
          args: [5, 10],
          msg: 'El código de postulación debe tener entre 5 y 10 caracteres.',
        },
      },
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de asignación debe ser una fecha válida.',
        },
      },
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de cierre debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ProductoraPremio',
    tableName: 'ProductoraPremio',
    timestamps: true,
    indexes: [
      {
        fields: ['productora_id'],
        name: 'idx_productora_premio_productora_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_productora_premio_usuario_registrante_id',
      },
      {
        fields: ['codigo_postulacion'],
        name: 'idx_productora_premio_codigo_postulacion',
        unique: true,
      },
    ],
  }
);

ProductoraPremio.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuario',
  onDelete: 'SET NULL',
});

Usuario.hasMany(ProductoraPremio, {
  foreignKey: 'usuario_registrante_id',
  as: 'premios',
  onDelete: 'SET NULL',
});

ProductoraPremio.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraPremio, {
  foreignKey: 'productora_id',
  as: 'premios',
  onDelete: 'CASCADE',
});

export default ProductoraPremio;
