import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';

class Regla extends Model {
  public id_regla!: number;
  public descripcion!: string;
  public fecha_creacion!: Date;
  public activo!: boolean;
}

Regla.init(
  {
    id_regla: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Regla',
    tableName: 'Regla',
    timestamps: false,
  }
);

export default Regla;
