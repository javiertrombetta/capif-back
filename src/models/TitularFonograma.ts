import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Compania from './Compania';

class TitularFonograma extends Model {
  public id_titular_fonograma!: number;
  public id_fonograma!: number;
  public id_titular!: number;
  public fecha_inicio!: Date;
  public fecha_hasta!: Date | null;
  public porcentaje_titularidad!: number;
}

TitularFonograma.init(
  {
    id_titular_fonograma: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_fonograma: {
      type: DataTypes.UUID,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del fonograma es obligatorio.',
        },
        isInt: {
          msg: 'El ID del fonograma debe ser un número entero.',
        },
      },
    },
    id_titular: {
      type: DataTypes.UUID,
      references: {
        model: Compania,
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID del titular es obligatorio.',
        },
        isInt: {
          msg: 'El ID del titular debe ser un número entero.',
        },
      },
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de inicio debe ser una fecha válida.',
        },
      },
    },
    fecha_hasta: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de finalización debe ser una fecha válida.',
        },
      },
    },
    porcentaje_titularidad: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.0,
      validate: {
        min: {
          args: [0.01],
          msg: 'El porcentaje de titularidad debe ser mayor que 0.',
        },
        max: {
          args: [100],
          msg: 'El porcentaje de titularidad no puede exceder el 100%.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TitularFonograma',
    tableName: 'TitularFonograma',
    timestamps: true,
  }
);

export default TitularFonograma;
