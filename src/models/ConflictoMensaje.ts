import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Conflicto from './Conflicto';
import Usuario from './Usuario';

const ETAPA_RESOLUCION = ['RESOLUCION PRIMERA INSTANCIA', 'RESOLUCION SEGUNDA INSTANCIA'] as const;

class ConflictoMensaje extends Model {
  public id_mensaje!: string;
  public conflicto_id!: string;
  public usuario_registrante_id!: string;
  public etapa_resolucion_conflicto!: (typeof ETAPA_RESOLUCION)[number];
  public mensaje!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public conflicto?: Conflicto;
  public usuarioRegistrante?: Usuario;
  public usuarioPrincipal?: Usuario;

  public static associations: {
    conflicto: Association<ConflictoMensaje, Conflicto>;
    usuarioRegistrante: Association<ConflictoMensaje, Usuario>;
    usuarioPrincipal: Association<ConflictoMensaje, Usuario>;
  };
}

ConflictoMensaje.init(
  {
    id_mensaje: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del mensaje debe ser un UUID válido.',
        },
      },
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
    etapa_resolucion_conflicto: {
      type: DataTypes.ENUM(...ETAPA_RESOLUCION),
      allowNull: false,
      validate: {
        isIn: {
          args: [ETAPA_RESOLUCION],
          msg: 'La etapa de resolución no es válida.',
        },
      },
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El mensaje no puede estar vacío.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'ConflictoMensaje',
    tableName: 'ConflictoMensaje',
    timestamps: true,
    indexes: [
      {
        fields: ['conflicto_id'],
        name: 'idx_conflicto_mensaje_conflicto_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_conflicto_mensaje_usuario_registrante_id',
      },
      {
        fields: ['usuario_principal_id'],
        name: 'idx_conflicto_mensaje_usuario_principal_id',
      },
      {
        fields: ['etapa_resolucion_conflicto'],
        name: 'idx_conflicto_mensaje_etapa_resolucion',
      },
    ],
  }
);

ConflictoMensaje.belongsTo(Conflicto, {
  foreignKey: 'conflicto_id',
  as: 'conflicto',
  onDelete: 'CASCADE',
});

Conflicto.hasMany(ConflictoMensaje, {
  foreignKey: 'conflicto_id',
  as: 'mensajes',
  onDelete: 'CASCADE',
});

ConflictoMensaje.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(ConflictoMensaje, {
  foreignKey: 'usuario_registrante_id',
  as: 'mensajesRegistrados',
  onDelete: 'SET NULL',
});

export default ConflictoMensaje;