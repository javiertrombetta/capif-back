import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import FonogramaTerritorio from './FonogramaTerritorio';

class FonogramaTerritorioMaestro extends Model {
  public id_territorio_maestro!: string;
  public fonograma_id!: string;
  public territorio_id!: string;
  public is_activo!: boolean;  

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonogramaDelVinculo?: Fonograma;
  public territorioDelVinculo?: FonogramaTerritorio;

  public static associations: {
    fonogramaDelVinculo: Association<FonogramaTerritorioMaestro, Fonograma>;
    territorioDelVinculo: Association<FonogramaTerritorioMaestro, FonogramaTerritorio>;
  };
}

FonogramaTerritorioMaestro.init(
  {
    id_territorio_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de territorio maestro debe ser un UUID válido.',
        },
      },
    },
    fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Fonograma,
        key: 'id_fonograma',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del fonograma debe ser un UUID válido.',
        },
      },
    },
    territorio_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: FonogramaTerritorio,
        key: 'id_territorio',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del territorio debe ser un UUID válido.',
        },
      },
    },
    is_activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'FonogramaTerritorioMaestro',
    tableName: 'FonogramaTerritorioMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ["fonograma_id"],
        name: "idx_territorio_maestro_fonograma_id",
      },
      {
        fields: ["territorio_id"],
        name: "idx_territorio_maestro_territorio_id",
      },
      {
        fields: ["fonograma_id", "territorio_id"],
        name: "idx_territorio_maestro_fonograma_territorio",
        unique: true,
      },
      {
        fields: ["is_activo"],
        name: "idx_territorio_maestro_is_activo",
      },
    ],
  }
);

export default FonogramaTerritorioMaestro;