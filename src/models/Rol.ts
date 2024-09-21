import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';

class Rol extends Model {
  public id_rol!: number;
  public descripcion!: string;
}

Rol.init(
  {
    id_rol: {
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
  },
  {
    sequelize,
    modelName: 'Rol',
    tableName: 'Rol',
    timestamps: false,
  }
);

export default Rol;
