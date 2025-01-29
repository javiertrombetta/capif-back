import { Model, DataTypes, Association} from 'sequelize';
import sequelize from '../config/database/sequelize';
import UsuarioRol from './UsuarioRol';

class UsuarioVista extends Model {
  public id_vista!: string;
  public rol_id!: string;
  public nombre_vista_superior!: string | null;
  public nombre_vista!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public rolDeVista?: UsuarioRol;

  public static associations: {
    rolDeVista: Association<UsuarioVista, UsuarioRol>;
  };
}


UsuarioVista.init(
  {
    id_vista: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de la vista debe ser un UUID válido.',
        },
      },
    },
    rol_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UsuarioRol,
        key: 'id_rol',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del rol debe ser un UUID válido.',
        },
      },
    },
    nombre_vista_superior: {
      type: DataTypes.STRING,      
      allowNull: true,
      validate: {
        len: {
          args: [3, 50],
          msg: 'El nombre de la vista superior debe tener entre 3 y 50 caracteres.',
        },
      },
    },
    nombre_vista: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: 'El nombre de la vista debe tener entre 3 y 50 caracteres.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'UsuarioVista',
    tableName: 'UsuarioVista',
    timestamps: true,
    indexes: [
      {
        fields: ['rol_id', 'nombre_vista_superior'],
        name: 'idx_rol_nombre_vista',
      },
      {
        fields: ['nombre_vista', 'nombre_vista_superior'],
        name: 'idx_nombre_vista_superior',
      },
    ],
  }
);



export default UsuarioVista;