import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Conflicto from './Conflicto';
import FonogramaParticipacion from './FonogramaParticipacion';

const TIPO_ESTADOS = [
  'PENDIENTE',
  'RESPONDIDO',
  'DESISTIDO',
  'MODIFICADO',
  'RETIRADO',
  'ACEPTADO',
] as const;

class ConflictoParte extends Model {
  public id_conflicto_participacion!: string;
  public conflicto_id!: string;
  public participacion_id!: string;
  public estado!: (typeof TIPO_ESTADOS)[number];
  public porcentaje_declarado!: number | null;
  public porcentaje_confirmado!: number | null;
  public is_documentos_enviados!: boolean;
  public fecha_respuesta_confirmacion!: Date | null;
  public fecha_respuesta_documentacion!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public conflictoDeLaParte?: Conflicto;
  public participacionDeLaParte?: FonogramaParticipacion;

  public static associations: {
    conflictoDeLaParte: Association<ConflictoParte, Conflicto>;
    participacionDeLaParte: Association<ConflictoParte, FonogramaParticipacion>;
  };
}

ConflictoParte.init(
  {
    id_conflicto_participacion: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    conflicto_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Conflicto,
        key: 'id_conflicto',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del conflicto debe ser un UUID válido.',
        },
      },
    },
    participacion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FonogramaParticipacion,
        key: 'id_participacion',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la participación debe ser un UUID válido.',
        },
      },
    },
    estado: {
      type: DataTypes.ENUM(...TIPO_ESTADOS),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    porcentaje_declarado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isDecimal: {
          msg: 'El porcentaje confirmado debe ser un número entero positivo.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje confirmado no puede ser menor que 0.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje confirmado no puede ser mayor que 100.',
        },
      },
    },
    porcentaje_confirmado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isDecimal: {
          msg: 'El porcentaje confirmado debe ser un número entero positivo.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje confirmado no puede ser menor que 0.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje confirmado no puede ser mayor que 100.',
        },
      },
    },
    is_documentos_enviados: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_respuesta_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de respuesta debe ser una fecha válida.',
        },
      },
    },
    fecha_respuesta_documentacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de respuesta debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ConflictoParte',
    tableName: 'ConflictoParte',
    timestamps: true,
    indexes: [
      { fields: ['conflicto_id'], name: 'idx_conflicto_participacion_conflicto_id' },
      { fields: ['participacion_id'], name: 'idx_conflicto_participacion_participacion_id' },
      { fields: ['conflicto_id', 'estado'], name: 'idx_conflicto_participacion_conflicto_estado' },
      { fields: ['createdAt'], name: 'idx_conflicto_participacion_created_at' },
      { fields: ['estado'], name: 'idx_conflicto_participacion_estado' },
      { fields: ['fecha_respuesta_confirmacion'], name: 'idx_conflicto_participacion_fecha_confirmacion' },
      { fields: ['fecha_respuesta_documentacion'], name: 'idx_conflicto_participacion_fecha_documentacion' },
    ],
  }
);

export default ConflictoParte;