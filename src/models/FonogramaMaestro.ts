import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';

const OPERACIONES_PERMITIDAS = ['ALTA', 'DATOS', 'ARCHIVO', 'TERRITORIO', 'PARTICIPACION', 'BAJA'] as const;

class FonogramaMaestro extends Model {
  public id_fonograma_maestro!: string;
  public fonograma_id!: string;
  public operacion!: (typeof OPERACIONES_PERMITIDAS)[number];
  public fecha_operacion!: Date;
  public isProcesado!: Boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonogramaDelMaestroDeFonograma?: Fonograma;


  public static associations: {
    fonogramaDelMaestroDeFonograma: Association<FonogramaMaestro, Fonograma>;
  };
}

FonogramaMaestro.init(
  {
    id_fonograma_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de fonograma maestro debe ser un UUID válido.',
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
    operacion: {
      type: DataTypes.ENUM(...OPERACIONES_PERMITIDAS),
      allowNull: false,
      validate: {
        isIn: {
          args: [OPERACIONES_PERMITIDAS],
          msg: 'La operación debe ser una de las permitidas: ALTA, DATOS o BAJA.',
        },
      },
    },
    fecha_operacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de operación debe ser una fecha válida.',
        },
      },
    },
    isProcesado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: 'El campo isProcesado debe ser un booleano.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaMaestro',
    tableName: 'FonogramaMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_maestro_fonograma_id',
      },
      {
        fields: ['operacion'],
        name: 'idx_maestro_operacion',
      },
      {
        fields: ['isProcesado'],
        name: 'idx_maestro_is_procesado',
      },
    ],
  }
);

export default FonogramaMaestro;
