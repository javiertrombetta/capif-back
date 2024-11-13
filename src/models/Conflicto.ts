import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { updateConflictosActivos } from '../services/checkModels';
import Fonograma from './Fonograma';
import ConflictoMensaje from './ConflictoMensaje';
import Usuario from './Usuario';

const TIPO_ESTADOS = [
  'PRIMERA INSTANCIA',
  'PRIMERA PRORROGA',
  'SEGUNDA INSTANCIA',
  'SEGUNDA PRORROGA',
  'PRIMERA PRESENTACION',
  'SEGUNDA PRESENTACION',
  'FINALIZADO - VENCIDO',
  'FINALIZADO - ACEPTADO',
  'FINALIZADO - RECHAZADO',
] as const;

class Conflicto extends Model {
  public id_conflicto!: string;
  public usuario_registrante_id!: string;
  public productora_registrante_id!: string;
  public fonograma_id!: string;
  public estado_conflicto!: (typeof TIPO_ESTADOS)[number];
  public fecha_inicio_conflicto!: Date;
  public fecha_segunda_instancia!: Date | null;
  public fecha_fin_conflicto!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public get fecha_vencimiento(): Date | null {
    const inicio = new Date(this.fecha_inicio_conflicto);

    if (this.estado_conflicto === 'SEGUNDA INSTANCIA' && this.fecha_segunda_instancia) {
      const segundaInstanciaInicio = new Date(this.fecha_segunda_instancia);
      return new Date(segundaInstanciaInicio.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 días desde la segunda instancia
    }

    switch (this.estado_conflicto) {
      case 'PRIMERA INSTANCIA':
        return new Date(inicio.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 días corridos desde el inicio
      case 'PRIMERA PRORROGA':
        return new Date(inicio.getTime() + (15 + 7) * 24 * 60 * 60 * 1000); // 15 días + 7 días de prórroga
      case 'SEGUNDA PRORROGA':
        if (this.fecha_segunda_instancia) {
          const segundaInstanciaInicio = new Date(this.fecha_segunda_instancia);
          return new Date(segundaInstanciaInicio.getTime() + (60 + 30) * 24 * 60 * 60 * 1000); // 60 días + 30 días de prórroga
        }
        return null;
      default:
        return null;
    }
  }

  public isVencido(): boolean {
    const fechaVencimiento = this.fecha_vencimiento;
    return fechaVencimiento ? fechaVencimiento < new Date() : false;
  }

  public fonograma?: Fonograma;
  public usuarioRegistrante?: Usuario;
  public mensajes?: ConflictoMensaje[];

  public static associations: {
    fonograma: Association<Conflicto, Fonograma>;
    usuarioRegistrante: Association<Conflicto, Usuario>;
    mensajes: Association<Conflicto, ConflictoMensaje>;
  };
}

Conflicto.init(
  {
    id_conflicto: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de conflicto debe ser un UUID válido.',
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
    productora_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la productora registrante debe ser un UUID válido.',
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
    estado_conflicto: {
      type: DataTypes.ENUM(...TIPO_ESTADOS),
      allowNull: false,
      validate: {
        isIn: {
          args: [TIPO_ESTADOS],
          msg: 'El estado de conflicto no es válido.',
        },
      },
    },
    fecha_inicio_conflicto: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de inicio del conflicto debe ser una fecha válida.',
        },
      },
    },
    fecha_segunda_instancia: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de segunda instancia debe ser una fecha válida.',
        },
      },
    },
    fecha_fin_conflicto: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de fin del conflicto debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Conflicto',
    tableName: 'Conflicto',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_conflicto_usuario_registrante_id',
      },
      {
        fields: ['fonograma_id'],
        name: 'idx_conflicto_fonograma_id',
      },
      {
        fields: ['estado_conflicto'],
        name: 'idx_conflicto_estado',
      },
      {
        fields: ['fecha_inicio_conflicto'],
        name: 'idx_conflicto_fecha_inicio',
      },
    ],
  }
);

Conflicto.afterCreate(async (conflicto) => {
  await updateConflictosActivos(conflicto.fonograma_id, Conflicto, Fonograma);
});

Conflicto.afterUpdate(async (conflicto) => {
  await updateConflictosActivos(conflicto.fonograma_id, Conflicto, Fonograma);
});

Conflicto.afterDestroy(async (conflicto) => {
  await updateConflictosActivos(conflicto.fonograma_id, Conflicto, Fonograma);
});

Conflicto.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(Conflicto, {
  foreignKey: 'fonograma_id',
  as: 'conflictos',
  onDelete: 'RESTRICT',
});

Conflicto.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(Conflicto, {
  foreignKey: 'usuario_registrante_id',
  as: 'conflictosRegistrados',
  onDelete: 'SET NULL',
});

Conflicto.hasMany(ConflictoMensaje, {
  foreignKey: 'conflicto_id',
  as: 'mensajes',
  onDelete: 'CASCADE',
});

export default Conflicto;
