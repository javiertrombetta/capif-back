import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class CuentaCorriente extends Model {}

CuentaCorriente.init(
  {
    id_cuenta_corriente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Usuario',
        key: 'id_usuario',
      },
    },
    saldo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'CuentaCorriente',
    tableName: 'cuentas_corrientes',
  }
);

export default CuentaCorriente;