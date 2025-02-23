import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import { updateConflictosActivos } from '../utils/checkModels';
import Fonograma from './Fonograma';
import Productora from './Productora';

const TIPO_ESTADOS = [
  'PENDIENTE CAPIF',
  'PRIMERA INSTANCIA',
  'PRIMERA PRORROGA',
  'SEGUNDA INSTANCIA',
  'SEGUNDA PRORROGA',
  'VENCIDO',
  'CERRADO',
] as const;

class Conflicto extends Model {
  public id_conflicto!: string;
  public productora_id!: string;
  public fonograma_id!: string;
  public estado_conflicto!: (typeof TIPO_ESTADOS)[number];
  public fecha_periodo_desde!: Date;
  public fecha_periodo_hasta!: Date;
  public porcentaje_periodo!: number;
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

  public productoraDelConflicto?: Productora;
  public fonogramaDelConflicto?: Fonograma;

  public static associations: {
    productoraDelConflicto: Association<Conflicto, Productora>;
    fonogramaDelConflicto: Association<Conflicto, Fonograma>;   
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
    fecha_periodo_desde: {
      type: DataTypes.DATE,
      allowNull: false,    
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha desde del período a tomar del conflicto debe ser válida.',
        },
      },
    },
    fecha_periodo_hasta: {
      type: DataTypes.DATE,
      allowNull: false,  
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha hasta del período a tomar del conflicto debe ser válida.',
        },
      },
    },
    porcentaje_periodo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'El porcentaje de participación debe ser un número entero positivo.',
        },
        min: {
          args: [0],
          msg: 'El porcentaje de participación no puede ser menor a 0.',
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
        fields: ['productora_id'],
        name: 'idx_conflicto_productora_id',
      },
      {
        fields: ['fonograma_id'],
        name: 'idx_conflicto_fonograma_id',
      },
      {
        fields: ['estado_conflicto'],
        name: 'idx_conflicto_estado',
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

export default Conflicto;
