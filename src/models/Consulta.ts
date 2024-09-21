import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';

class Consulta extends Model {
  public id_consulta!: number;
  public id_usuario!: number;
  public asunto!: string;
  public mensaje?: string;
  public fecha_envio!: Date;
  public estado_id?: number;
}

Consulta.init(
  {
    id_consulta: {
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
    asunto: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    mensaje: {
      type: DataTypes.TEXT,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Estado,
        key: 'id_estado',
      },
    },
  },
  {
    sequelize,
    modelName: 'Consulta',
    tableName: 'Consulta',
    timestamps: false,
  }
);

export default Consulta;
