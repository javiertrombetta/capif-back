import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Estado from './Estado';

class Tramite extends Model {
  public id_tramite!: number;
  public id_usuario!: number;
  public tipo_tramite!: string;
  public fecha_inicio!: Date;
  public estado_id?: number;
}

Tramite.init(
  {
    id_tramite: {
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
    tipo_tramite: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fecha_inicio: {
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
    modelName: 'Tramite',
    tableName: 'Tramite',
    timestamps: false,
  }
);

export default Tramite;
