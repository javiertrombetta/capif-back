import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Usuario from './Usuario';
import FonogramaISRC from './FonogramaISRC';
import UsuarioProductora from './Productora';

class FonogramaParticipacion extends Model {
  public id_participacion!: string;
  public fonograma_id!: string;
  public isrc_id!: string;
  public productora_id!: string;
  public usuario_registrante_id!: string;
  public fecha_participacion_inicio!: Date;
  public fecha_participacion_hasta!: Date | null;
  public porcentaje_participacion!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public isrc?: FonogramaISRC;
  public productora?: UsuarioProductora;
  public usuarioRegistrante?: Usuario;

  public static associations: {
    fonograma: Association<FonogramaParticipacion, Fonograma>;
    isrc: Association<FonogramaParticipacion, FonogramaISRC>;
    productora: Association<FonogramaParticipacion, UsuarioProductora>;
    usuarioRegistrante: Association<FonogramaParticipacion, Usuario>;
  };
}

FonogramaParticipacion.init(
  {
    id_participacion: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de participación debe ser un UUID válido.',
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
    isrc_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FonogramaISRC,
        key: 'id_isrc',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del ISRC debe ser un UUID válido.',
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
    fecha_participacion_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de inicio de participación debe ser una fecha válida.',
        },
      },
    },
    fecha_participacion_hasta: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de finalización de participación debe ser una fecha válida.',
        },
      },
    },
    porcentaje_participacion: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El porcentaje de participación debe ser un número decimal válido.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje de participación no puede ser menor a 0.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje de participación no puede ser mayor a 100.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaParticipacion',
    tableName: 'FonogramaParticipacion',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_participacion_fonograma_id',
      },
      {
        fields: ['isrc_id'],
        name: 'idx_participacion_isrc_id',
      },
      {
        fields: ['productora_id'],
        name: 'idx_participacion_productora_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_participacion_usuario_registrante_id',
      },
    ],
  }
);

// Asociaciones
FonogramaParticipacion.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaParticipacion, {
  foreignKey: 'fonograma_id',
  as: 'participaciones',
  onDelete: 'RESTRICT',
});

FonogramaParticipacion.belongsTo(FonogramaISRC, {
  foreignKey: 'isrc_id',
  as: 'isrc',
  onDelete: 'RESTRICT',
});

FonogramaISRC.hasMany(FonogramaParticipacion, {
  foreignKey: 'isrc_id',
  as: 'participaciones',
  onDelete: 'RESTRICT',
});

FonogramaParticipacion.belongsTo(UsuarioProductora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

UsuarioProductora.hasMany(FonogramaParticipacion, {
  foreignKey: 'productora_id',
  as: 'participaciones',
  onDelete: 'RESTRICT',
});

FonogramaParticipacion.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaParticipacion, {
  foreignKey: 'usuario_registrante_id',
  as: 'participacionesRegistradas',
  onDelete: 'SET NULL',
});

export default FonogramaParticipacion;
