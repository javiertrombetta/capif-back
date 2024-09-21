import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Usuario from './Usuario';

class Repertorio extends Model {
  public id_repertorio!: number;
  public id_usuario!: number;
  public titulo!: string;
  public tipo?: string;
  public fecha_creacion!: Date;
  public codigo_postulacion?: string;
}

Repertorio.init(
  {
    id_repertorio: {
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
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tipo: {
      type: DataTypes.STRING(50),
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    codigo_postulacion: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,
    modelName: 'Repertorio',
    tableName: 'Repertorio',
    timestamps: false,
  }
);

export default Repertorio;
