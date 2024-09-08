import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Pago extends Model {}

Pago.init(
  {
    id_pago: {
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
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    metodo_pago: {
      type: DataTypes.STRING(50),
    },
    referencia: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize,
    modelName: 'Pago',
    tableName: 'pagos',
  }
);

export default Pago;