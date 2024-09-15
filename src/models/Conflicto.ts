import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/config';
import Fonograma from './Fonograma';
import Estado from './Estado';

class Conflicto extends Model {
  public id_conflicto!: number;
  public id_fonograma!: number;
  public tipo_conflicto!: string;
  public descripcion?: string;
  public estado_id?: number;
  public fecha_creacion!: Date;
  public fecha_resolucion?: Date;
}

Conflicto.init(
  {
    id_conflicto: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_fonograma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      onDelete: 'CASCADE',
    },
    tipo_conflicto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Estado,
        key: 'id_estado',
      },
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Conflicto',
    tableName: 'Conflicto',
    timestamps: false,
  }
);

export default Conflicto;
