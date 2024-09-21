import { DataTypes, Model } from 'sequelize';
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
        notEmpty: true,
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

export default TipoPersona;
