import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class AuditoriaCambio extends Model {
  public id_auditoria!: number;
  public id_usuario!: number;
  public fecha!: Date;
  public tabla_afectada!: string;
  public operacion!: string;
  public descripcion!: string;
}

AuditoriaCambio.init(
  {
    id_auditoria: {
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
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    tabla_afectada: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    operacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'AuditoriaCambio',
    tableName: 'AuditoriaCambio',
    timestamps: false,
  }
);

export default AuditoriaCambio;
