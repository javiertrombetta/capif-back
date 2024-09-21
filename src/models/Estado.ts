import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import TipoEstado from './TipoEstado';

class Estado extends Model {
  public id_estado!: number;
  public descripcion!: string;
  public tipo_estado_id!: number;
}

Estado.init(
  {
    id_estado: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tipo_estado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TipoEstado,
        key: 'id_tipo_estado',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Estado',
    tableName: 'Estado',
    timestamps: false,
  }
);

export default Estado;
