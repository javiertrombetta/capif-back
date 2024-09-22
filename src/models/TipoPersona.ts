import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database/sequelize';

class TipoPersona extends Model {
  public id_tipo_persona!: number;
  public descripcion!: string;
}

TipoPersona.init(
  {
    id_tipo_persona: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: 'La descripción debe tener entre 3 y 50 caracteres.',
        },
        is: {
          args: /^[A-Za-z\s]+$/,
          msg: 'La descripción solo puede contener letras y espacios.',
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía.',
        },
        notNull: {
          msg: 'La descripción es un campo obligatorio.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoPersona',
    tableName: 'TipoPersona',
    timestamps: false,
  }
);

TipoPersona.beforeSave((tipoPersona) => {
  tipoPersona.descripcion = tipoPersona.descripcion.trim().toUpperCase();
});

export default TipoPersona;
