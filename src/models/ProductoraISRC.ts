import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Productora from './Productora';

const TIPOS_CODIGO = ['AUDIO', 'VIDEO'] as const;

class ProductoraISRC extends Model {
  public id_productora_isrc!: string;
  public productora_id!: string;
  public codigo_productora!: string;
  public tipo!: (typeof TIPOS_CODIGO)[number];
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductoraISRC.init(
  {
    id_productora_isrc: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID debe ser un UUID válido.',
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
    codigo_productora: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: 'El código ISRC debe ser alfanumérico.',
        },
        len: {
          args: [3, 3],
          msg: 'El código ISRC debe tener exactamente 3 caracteres.',
        },
      },
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_CODIGO),
      allowNull: false,
      validate: {
        isIn: {
          args: [TIPOS_CODIGO],
          msg: `El tipo debe ser uno de los siguientes: ${TIPOS_CODIGO.join(', ')}.`,
        },
      },
    },
    
  },
  {
    sequelize,
    modelName: 'ProductoraISRC',
    tableName: 'ProductoraISRC',
    timestamps: true,
    indexes: [
      {
        fields: ['productora_id'],
      },
      {
        fields: ['codigo_productora', 'tipo'],
        unique: true,
      },
    ],
  }
);

// Hook para asignar los primeros códigos disponibles
ProductoraISRC.beforeBulkCreate(async (productorasISRC, options) => {
  // Verificar que la creación sea para dos códigos (audio y video)
  if (productorasISRC.length !== 2) {
    throw new Error('Deben generarse exactamente dos códigos: uno para AUDIO y otro para VIDEO.');
  }

  const availableCodes = await ProductoraISRC.findAll({
    where: { productora_id: null },
    order: [['codigo_productora', 'ASC']],
    limit: 2, // Obtener los dos primeros códigos disponibles
  });

  if (availableCodes.length < 2) {
    throw new Error('No hay suficientes códigos disponibles en ProductoraISRC.');
  }

  // Asignar códigos correlativos y tipos a las instancias
  productorasISRC.forEach((productoraISRC, index) => {
    productoraISRC.codigo_productora = availableCodes[index].codigo_productora;
    productoraISRC.tipo = index === 0 ? 'AUDIO' : 'VIDEO';

    // Marcar el código como asignado
    availableCodes[index].productora_id = productoraISRC.productora_id;
    availableCodes[index].save({ transaction: options.transaction });
  });
});

export default ProductoraISRC;