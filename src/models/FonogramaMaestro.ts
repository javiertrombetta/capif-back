import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database/sequelize';
import Fonograma from './Fonograma';
import Usuario from './Usuario';

const OPERACIONES_PERMITIDAS = ['ALTA', 'DATOS', 'BAJA'] as const;

class FonogramaMaestro extends Model {
  public id_fonograma_maestro!: string;
  public fonograma_id!: string;
  public usuario_registrante_id!: string;
  public usuario_principal_id!: string;
  public operacion!: (typeof OPERACIONES_PERMITIDAS)[number];
  public fecha_operacion!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public fonograma?: Fonograma;
  public usuarioRegistrante?: Usuario;
  public usuarioPrincipal?: Usuario;

  public static associations: {
    fonograma: Association<FonogramaMaestro, Fonograma>;
    usuarioRegistrante: Association<FonogramaMaestro, Usuario>;
    usuarioPrincipal: Association<FonogramaMaestro, Usuario>;
  };
}

FonogramaMaestro.init(
  {
    id_fonograma_maestro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID de fonograma maestro debe ser un UUID válido.',
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
    usuario_principal_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id_usuario',
      },
      validate: {
        isUUID: {
          args: 4,
          msg: 'El ID del usuario principal debe ser un UUID válido.',
        },
      },
    },
    operacion: {
      type: DataTypes.ENUM(...OPERACIONES_PERMITIDAS),
      allowNull: false,
      validate: {
        isIn: {
          args: [OPERACIONES_PERMITIDAS],
          msg: 'La operación debe ser una de las permitidas: ALTA, DATOS o BAJA.',
        },
      },
    },
    fecha_operacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          args: true,
          msg: 'La fecha de operación debe ser una fecha válida.',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'FonogramaMaestro',
    tableName: 'FonogramaMaestro',
    timestamps: true,
    indexes: [
      {
        fields: ['fonograma_id'],
        name: 'idx_maestro_fonograma_id',
      },
      {
        fields: ['usuario_registrante_id'],
        name: 'idx_maestro_usuario_registrante_id',
      },
      {
        fields: ['usuario_principal_id'],
        name: 'idx_maestro_usuario_principal_id',
      },
      {
        fields: ['operacion'],
        name: 'idx_maestro_operacion',
      },
      {
        fields: ['fecha_operacion'],
        name: 'idx_maestro_fecha_operacion',
      },
    ],
  }
);

FonogramaMaestro.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaMaestro, {
  foreignKey: 'fonograma_id',
  as: 'maestros',
  onDelete: 'RESTRICT',
});

FonogramaMaestro.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'usuarioRegistrante',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaMaestro, {
  foreignKey: 'usuario_registrante_id',
  as: 'maestrosRegistrados',
  onDelete: 'SET NULL',
});

FonogramaMaestro.belongsTo(Usuario, {
  foreignKey: 'usuario_principal_id',
  as: 'usuarioPrincipal',
  onDelete: 'SET NULL',
});

Usuario.hasMany(FonogramaMaestro, {
  foreignKey: 'usuario_principal_id',
  as: 'maestrosPrincipales',
  onDelete: 'SET NULL',
});

export default FonogramaMaestro;
