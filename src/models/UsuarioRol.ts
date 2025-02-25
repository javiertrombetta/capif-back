import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class UsuarioRol extends Model {
  public id_rol!: string;
  public nombre_rol!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsuarioRol.init(
  {
    id_rol: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del rol debe ser un UUID válido.',
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
    modelName: 'UsuarioRol',
    tableName: 'UsuarioRol',
    timestamps: true,
    indexes: [
      {
        fields: ["nombre_rol"],
        name: "idx_rol_nombre_rol",
        unique: true,
      },
      {
        fields: ["createdAt"],
        name: "idx_usuario_rol_created_at",
      },
      {
        fields: ["updatedAt"],
        name: "idx_usuario_rol_updated_at",
      },
    ],
  }
);



export default UsuarioRol;
