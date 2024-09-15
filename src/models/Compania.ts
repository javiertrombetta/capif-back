import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/config';
import Estado from './Estado';
import TipoCompania from './TipoCompania';

class Compania extends Model {
  public id_compania!: number;
  public nombre_compania!: string;
  public direccion?: string;
  public telefono?: string;
  public email?: string;
  public cuit!: string;
  public tipo_compania_id!: number;
  public estado_id!: number;
}

Compania.init(
  {
    id_compania: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_compania: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    direccion: {
      type: DataTypes.STRING(200),
    },
    telefono: {
      type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(150),
      validate: {
        isEmail: true,
      },
    },
    cuit: {
      type: DataTypes.CHAR(11),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
        len: [11, 11],
      },
    },
    tipo_compania_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TipoCompania,
        key: 'id_tipo_compania',
      },
      onDelete: 'CASCADE',
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
    modelName: 'Compania',
    tableName: 'Compania',
    timestamps: false,
  }
);

export default Compania;
