import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Productora from './Productora';
import { updatePorcentajeTitularidad } from '../services/checkModels';

class FonogramaParticipacion extends Model {
  public id_participacion!: string;
  public fonograma_id!: string;
  public productora_id!: string;
  public fecha_participacion_inicio!: Date;
  public fecha_participacion_hasta!: Date;
  public porcentaje_participacion!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonogramaDelParticipante?: Fonograma;
  public productoraDeParticipante?: Productora;


  public static associations: {
    fonogramaDelParticipante: Association<FonogramaParticipacion, Fonograma>;
    productoraDeParticipante: Association<FonogramaParticipacion, Productora>;
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
      allowNull: false,
      defaultValue: new Date('2099-12-20T00:00:00Z'),
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de finalización de participación debe ser una fecha válida.',
        },
      },
    },
    porcentaje_participacion: {
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
        fields: ['productora_id'],
        name: 'idx_participacion_productora_id',
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

export default FonogramaParticipacion;
