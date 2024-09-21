import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';

class ErroresInsercion extends Model {
  public id_error!: number;
  public tabla_afectada!: string;
  public descripcion_error!: string;
  public fecha_error!: Date;
}

ErroresInsercion.init(
  {
    id_error: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tabla_afectada: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion_error: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha_error: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ErroresInsercion',
    tableName: 'ErroresInsercion',
    timestamps: false,
  }
);

export default ErroresInsercion;
