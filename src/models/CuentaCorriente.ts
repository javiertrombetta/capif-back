import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/config';
import Usuario from './Usuario';

class CuentaCorriente extends Model {
  public id_cuenta_corriente!: number;
  public id_usuario!: number;
  public saldo!: number;
  public fecha_actualizacion!: Date;
}

CuentaCorriente.init(
  {
    id_cuenta_corriente: {
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
    saldo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CuentaCorriente',
    tableName: 'CuentaCorriente',
    timestamps: false,
  }
);

export default CuentaCorriente;
