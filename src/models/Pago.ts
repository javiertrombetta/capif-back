import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Pago extends Model {
  public id_pago!: number;
  public id_usuario!: number;
  public monto!: number;
  public fecha_pago!: Date;
  public metodo_pago?: string;
  public referencia?: string;
}

Pago.init(
  {
    id_pago: {
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
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: 'Pago',
    timestamps: false,
  }
);

export default Pago;
