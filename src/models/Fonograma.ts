import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Productora from './Productora';
import FonogramaArchivo from './FonogramaArchivo';
import FonogramaEnvio from './FonogramaEnvio';

const ESTADO_FONOGRAMA = ['ACTIVO', 'BAJA'] as const;

class Fonograma extends Model {
  public id_fonograma!: string;
  public productora_id!: string;
  public estado_fonograma!: (typeof ESTADO_FONOGRAMA)[number];
  public isrc!: string;
  public titulo!: string;
  public artista!: string;
  public album!: string | null;
  public duracion!: string;
  public sello_discografico!: string;
  public anio_lanzamiento!: number;
  public is_dominio_publico!: boolean;
  public cantidad_conflictos_activos!: number;
  public archivo_audio_id!: string | null;
  public envio_vericast_id!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public productoraDelFonograma?: Productora;
  public archivoDelFonograma?: FonogramaArchivo;
  public envioDelFonograma?: FonogramaEnvio;

  public static associations: {
    productoraDelFonograma: Association<Fonograma, Productora>;
    archivoDelFonograma: Association<Fonograma, FonogramaArchivo>;
    envioDelFonograma: Association<Fonograma, FonogramaEnvio>;
  };
}

Fonograma.init(
  {
    id_fonograma: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de fonograma debe ser un UUID válido.',
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
    estado_fonograma: {
      type: DataTypes.ENUM(...ESTADO_FONOGRAMA),
      allowNull: false,
      validate: {
        isIn: {
          args: [ESTADO_FONOGRAMA],
          msg: 'El estado del fonograma no es válido.',
        },
      },
    },
    isrc: {
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
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El título debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El título no puede estar vacío.',
        },
      },
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'El nombre del artista debe tener entre 2 y 100 caracteres.',
        },
        notEmpty: {
          msg: 'El campo artista no puede estar vacío.',
        },
      },
    },
    album: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    duracion: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: {
          args: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
          msg: 'La duración debe estar en formato HH:MM:SS.',
        },
      },
    },
    sello_discografico: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    anio_lanzamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'El año de lanzamiento debe ser un número entero.',
        },
        min: {
          args: [1900],
          msg: 'El año de lanzamiento no puede ser anterior a 1900.',
        },
        max: {
          args: [new Date().getFullYear()],
          msg: 'El año de lanzamiento no puede ser mayor al año actual.',
        },
      },
    },
    is_dominio_publico: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cantidad_conflictos_activos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'La cantidad de conflictos activos no puede ser negativa.',
        },
      },
    },    
    archivo_audio_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: FonogramaArchivo,
        key: 'id_archivo',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del archivo de audio debe ser un UUID válido.',
        },
      },
    },
    envio_vericast_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: FonogramaEnvio,
        key: 'id_envio_vericast',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de envío a Vericast debe ser un UUID válido.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Fonograma',
    tableName: 'Fonograma',
    timestamps: true,
    indexes: [
      {
        fields: ['productora_id'],
        name: 'idx_fonograma_productora_id',
      },
      {
        fields: ['estado_fonograma'],
        name: 'idx_fonograma_estado',
      },
      {
        fields: ['isrc'],
        name: 'idx_fonograma_isrc',
        unique: true,
      },
      {
        fields: ['titulo'],
        name: 'idx_fonograma_datos_titulo',
      },
      {
        fields: ['artista'],
        name: 'idx_fonograma_datos_artista',
      },
      {
        fields: ['sello_discografico'],
        name: 'idx_fonograma_datos_sello_discografico',
      },
      {
        fields: ['anio_lanzamiento'],
        name: 'idx_fonograma_datos_anio_lanzamiento',
      },
    ],
  }
);

Fonograma.afterCreate(async (fonograma, options) => {
  await Productora.increment('cantidad_fonogramas', {
    where: { id_productora: fonograma.productora_id },
    transaction: options?.transaction || undefined,
  });
});

Fonograma.afterDestroy(async (fonograma, options) => {
  await Productora.decrement('cantidad_fonogramas', {
    where: { id_productora: fonograma.productora_id },
    transaction: options?.transaction || undefined,
  });
});

export default Fonograma;
