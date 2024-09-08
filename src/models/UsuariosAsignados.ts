import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class UsuariosAsignados extends Model {}

UsuariosAsignados.init(
  {
    id_usuario_asignado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id_usuario',
      },
      onDelete: 'CASCADE',
    },
    id_compania: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Compania',
        key: 'id_compania',
      },
      onDelete: 'CASCADE',
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UsuariosAsignados',
    tableName: 'usuarios_asignados',
  }
);

export default UsuariosAsignados;