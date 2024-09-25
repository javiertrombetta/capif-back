import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Repertorio extends Model {
  public id_repertorio!: number;
  public titulo!: string;
  public tipo!: string | null;
  public id_usuario!: number;
}

Repertorio.init(
  {
    id_repertorio: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: {
          args: [3, 150],
          msg: 'El título debe tener entre 3 y 150 caracteres.',
        },
        notEmpty: {
          msg: 'El título no puede estar vacío.',
        },
      },
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: {
          args: [['Música', 'Literatura', 'Cine', 'Otro']],
          msg: 'El tipo debe ser uno de los siguientes: Música, Literatura, Cine, Otro.',
        },
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      allowNull: false,
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del usuario es obligatorio.',
        },
        isInt: {
          msg: 'El ID del usuario debe ser un número entero.',
        },
      },
    },    
  },
  {
    sequelize,
    modelName: 'Repertorio',
    tableName: 'Repertorio',
    timestamps: true,
  }
);

export default Repertorio;
