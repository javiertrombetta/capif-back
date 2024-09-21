import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';
import Compania from './Compania';

class UsuarioAsignado extends Model {
  public id_usuario_asignado!: number;
  public id_usuario!: number;
  public id_compania!: number;
  public fecha_asignacion!: Date;
}

UsuarioAsignado.init(
  {
    id_usuario_asignado: {
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
      onDelete: 'CASCADE',
    },
    id_compania: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Compania,
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UsuarioAsignado',
    tableName: 'UsuarioAsignado',
    timestamps: false,
  }
);

export default UsuarioAsignado;
