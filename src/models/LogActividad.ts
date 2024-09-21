import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class LogActividad extends Model {
  public id_log!: number;
  public id_usuario!: number;
  public actividad!: string;
  public fecha!: Date;
  public ip_origen!: string;
  public navegador!: string;
}

LogActividad.init(
  {
    id_log: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
    },
    actividad: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip_origen: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    navegador: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'LogActividad',
    tableName: 'LogActividad',
    timestamps: false,
  }
);

export default LogActividad;
