import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import UsuarioMaestro from './UsuarioMaestro';

class UsuarioRolTipo extends Model {
  public id_tipo_rol!: string;
  public nombre_rol!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsuarioRolTipo.init(
  {
    id_tipo_rol: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del tipo de rol debe ser un UUID válido.',
        },
      },
    },
    nombre_rol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 50],
          msg: 'El nombre del rol debe tener entre 3 y 50 caracteres.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'UsuarioRolTipo',
    tableName: 'UsuarioRolTipo',
    timestamps: true,
    indexes: [
      {
        fields: ['nombre_rol'],
        name: 'idx_rol_nombre_rol',
        unique: true,
      },
    ],
  }
);

UsuarioRolTipo.hasMany(UsuarioMaestro, {
  foreignKey: 'rol_id',
  as: 'usuariosMaestros',
  onDelete: 'RESTRICT',
});

export default UsuarioRolTipo;
