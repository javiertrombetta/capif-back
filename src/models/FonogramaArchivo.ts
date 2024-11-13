import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Usuario from './Usuario';

class FonogramaArchivo extends Model {
  public id_archivo!: string;
  public usuario_registrante_id!: string;
  public fonograma_id!: string;
  public ruta_archivo_audio!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public usuarioRegistrante?: Usuario;
  public usuarioPrincipal?: Usuario;
  public fonograma?: Fonograma;

  public static associations: {
    usuarioRegistrante: Association<FonogramaArchivo, Usuario>;
    usuarioPrincipal: Association<FonogramaArchivo, Usuario>;
    fonograma: Association<FonogramaArchivo, Fonograma>;
  };
}

FonogramaArchivo.init(
  {
    id_archivo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del archivo debe ser un UUID válido.',
        },
      },
    },
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario registrante debe ser un UUID válido.',
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
    ruta_archivo_audio: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La ruta del archivo de audio no puede estar vacía.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaArchivo',
    tableName: 'FonogramaArchivo',
    timestamps: true,
    indexes: [
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_fonograma_archivo_usuario_registrante_id',
      },
      {
        fields: ['usuario_principal_id'],
        name: 'idx_fonograma_archivo_usuario_principal_id',
      },
      {
        fields: ['fonograma_id'],
        name: 'idx_fonograma_archivo_fonograma_id',
      },
    ],
  }
);

FonogramaArchivo.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaArchivo, {
  foreignKey: 'usuario_registrante_id',
  as: 'archivosRegistrados',
  onDelete: 'SET NULL',
});

FonogramaArchivo.belongsTo(Usuario, {
  foreignKey: 'usuario_principal_id',
  as: 'usuarioPrincipal',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaArchivo, {
  foreignKey: 'usuario_principal_id',
  as: 'archivosPrincipales',
  onDelete: 'SET NULL',
});

FonogramaArchivo.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaArchivo, {
  foreignKey: 'fonograma_id',
  as: 'archivos',
  onDelete: 'RESTRICT',
});

export default FonogramaArchivo;
