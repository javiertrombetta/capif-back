import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/config';

class Usuario extends Model {}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
    },
    clave: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Roles',
        key: 'id_rol',
      },
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    estado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Estados',
        key: 'id_estado',
      },
    },
    cuit: {
      type: DataTypes.STRING(11),
      unique: true,
      allowNull: false,
    },
    tipo_persona_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'TiposPersona',
        key: 'id_tipo_persona',
      },
    },
    domicilio: {
      type: DataTypes.STRING(200),
    },
    ciudad: {
      type: DataTypes.STRING(100),
    },
    provincia: {
      type: DataTypes.STRING(100),
    },
    pais: {
      type: DataTypes.STRING(100),
    },
    telefono: {
      type: DataTypes.STRING(50),
    },
    codigo_isrc_audio: {
      type: DataTypes.STRING(10),
    },
    codigo_isrc_video: {
      type: DataTypes.STRING(10),
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
  }
);

export default Usuario;
