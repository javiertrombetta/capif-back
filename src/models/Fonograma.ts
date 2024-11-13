import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import FonogramaDatos from './FonogramaDatos';
import UsuarioProductora from './Productora';
import FonogramaTerritorialidad from './FonogramaTerritorialidad';
import FonogramaISRC from './FonogramaISRC';
import FonogramaArchivo from './FonogramaArchivo';
import FonogramaEnvio from './FonogramaEnvio';
import Conflicto from './Conflicto';
import FonogramaParticipacion from './FonogramaParticipacion';
import { updatePorcentajeTitularidad } from '../services/checkModels';

const ESTADO_FONOGRAMA = ['ACTIVO', 'BAJA'] as const;

class Fonograma extends Model {
  public id_fonograma!: string;
  public usuario_registrante_id!: string;
  public datos_fonograma_id!: string;
  public productora_id!: string;
  public estado_fonograma!: (typeof ESTADO_FONOGRAMA)[number];
  public isrc_audio_id!: string | null;
  public isrc_video_id!: string | null;
  public archivo_audio_id!: string | null;
  public envio_vericast_id!: string | null;
  public territorialidad_id!: string | null;
  public is_dominio_publico!: boolean;
  public cantidad_conflictos_activos!: number;
  public fecha_registro_desde!: Date;
  public fecha_registro_hasta!: Date;
  public porcentaje_titularidad_total!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioRegistrante?: Usuario;
  public datosFonograma?: FonogramaDatos;
  public productora?: UsuarioProductora;
  public territorialidad?: FonogramaTerritorialidad;
  public isrcAudio?: FonogramaISRC;
  public isrcVideo?: FonogramaISRC;
  public archivoAudio?: FonogramaArchivo;
  public envioVericast?: FonogramaEnvio;
  public conflictos?: Conflicto[];

  public static associations: {
    usuarioRegistrante: Association<Fonograma, Usuario>;
    datosFonograma: Association<Fonograma, FonogramaDatos>;
    productora: Association<Fonograma, UsuarioProductora>;
    territorialidad: Association<Fonograma, FonogramaTerritorialidad>;
    isrcAudio: Association<Fonograma, FonogramaISRC>;
    isrcVideo: Association<Fonograma, FonogramaISRC>;
    archivoAudio: Association<Fonograma, FonogramaArchivo>;
    envioVericast: Association<Fonograma, FonogramaEnvio>;
    conflictos: Association<Fonograma, Conflicto>;
    participaciones: Association<Fonograma, FonogramaParticipacion>;
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
    datos_fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FonogramaDatos,
        key: 'id_datos_fonograma',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de datos del fonograma debe ser un UUID válido.',
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
    isrc_audio_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: FonogramaISRC,
        key: 'id_isrc',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID ISRC de audio debe ser un UUID válido.',
        },
      },
    },
    isrc_video_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: FonogramaISRC,
        key: 'id_isrc',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID ISRC de video debe ser un UUID válido.',
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
        key: 'id_envio',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de envío a Vericast debe ser un UUID válido.',
        },
      },
    },
    territorialidad_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: FonogramaTerritorialidad,
        key: 'id_territorialidad',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de territorialidad debe ser un UUID válido.',
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
    fecha_registro_desde: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de registro desde debe ser una fecha válida.',
        },
      },
    },
    fecha_registro_hasta: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de registro hasta debe ser una fecha válida.',
        },
      },
    },
    porcentaje_titularidad_total: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El porcentaje de titularidad total debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje de titularidad total no puede ser menor que 0.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje de titularidad total no puede ser mayor que 100.',
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
        fields: ['usuario_registrante_id'],
        name: 'idx_fonograma_usuario_registrante_id',
      },
      {
        fields: ['datos_fonograma_id'],
        name: 'idx_fonograma_datos_fonograma_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_fonograma_productora_id',
      },
      {
        fields: ['estado_fonograma'],
        name: 'idx_fonograma_estado',
      },
    ],
  }
);

FonogramaParticipacion.afterCreate(async (participacion) => {
  await updatePorcentajeTitularidad(participacion.fonograma_id, Fonograma, FonogramaParticipacion);
});

FonogramaParticipacion.afterUpdate(async (participacion) => {
  await updatePorcentajeTitularidad(participacion.fonograma_id, Fonograma, FonogramaParticipacion);
});

FonogramaParticipacion.afterDestroy(async (participacion) => {
  await updatePorcentajeTitularidad(participacion.fonograma_id, Fonograma, FonogramaParticipacion);
});

Fonograma.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(Fonograma, {
  foreignKey: 'usuario_registrante_id',
  as: 'fonogramasRegistrados',
  onDelete: 'SET NULL',
});

Fonograma.belongsTo(FonogramaDatos, {
  foreignKey: 'datos_fonograma_id',
  as: 'datosFonograma',
  onDelete: 'RESTRICT',
});

FonogramaDatos.hasMany(Fonograma, {
  foreignKey: 'datos_fonograma_id',
  as: 'fonogramas',
  onDelete: 'RESTRICT',
});

Fonograma.belongsTo(UsuarioProductora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

UsuarioProductora.hasMany(Fonograma, {
  foreignKey: 'productora_id',
  as: 'fonogramas',
  onDelete: 'RESTRICT',
});

Fonograma.belongsTo(FonogramaTerritorialidad, {
  foreignKey: 'territorialidad_id',
  as: 'territorialidad',
  onDelete: 'SET NULL',
});

FonogramaTerritorialidad.hasMany(Fonograma, {
  foreignKey: 'territorialidad_id',
  as: 'fonogramas',
  onDelete: 'SET NULL',
});

Fonograma.belongsTo(FonogramaISRC, {
  foreignKey: 'isrc_audio_id',
  as: 'isrcAudio',
  onDelete: 'RESTRICT',
});

Fonograma.belongsTo(FonogramaISRC, {
  foreignKey: 'isrc_video_id',
  as: 'isrcVideo',
  onDelete: 'RESTRICT',
});

Fonograma.belongsTo(FonogramaArchivo, {
  foreignKey: 'archivo_audio_id',
  as: 'archivoAudio',
  onDelete: 'SET NULL',
});

FonogramaArchivo.hasMany(Fonograma, {
  foreignKey: 'archivo_audio_id',
  as: 'fonogramas',
  onDelete: 'SET NULL',
});

Fonograma.belongsTo(FonogramaEnvio, {
  foreignKey: 'envio_vericast_id',
  as: 'envioVericast',
  onDelete: 'SET NULL',
});

FonogramaEnvio.hasMany(Fonograma, {
  foreignKey: 'envio_vericast_id',
  as: 'fonogramas',
  onDelete: 'SET NULL',
});

Fonograma.hasMany(Conflicto, {
  foreignKey: 'fonograma_id',
  as: 'conflictos',
  onDelete: 'RESTRICT',
});

export default Fonograma;
