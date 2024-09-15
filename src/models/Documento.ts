import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/config';
import Tramite from './Tramite';

class Documento extends Model {
  public id_documento!: number;
  public id_tramite!: number;
  public nombre_documento!: string;
  public tipo_documento!: string;
  public ruta_documento!: string;
  public fecha_subida!: Date;
}

Documento.init(
  {
    id_documento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_tramite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tramite,
        key: 'id_tramite',
      },
    },
    nombre_documento: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tipo_documento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    ruta_documento: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Documento',
    tableName: 'Documento',
    timestamps: false,
  }
);

// Relaciones
Documento.belongsTo(Tramite, { foreignKey: 'id_tramite' });
Tramite.hasMany(Documento, { foreignKey: 'id_tramite' });

export default Documento;
