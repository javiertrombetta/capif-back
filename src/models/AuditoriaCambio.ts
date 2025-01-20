import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database/sequelize";
import Usuario from "./Usuario";

export const ENTIDADES_PERMITIDAS = [
  "AuditoriaCambio",
  "AuditoriaRepertorio",
  "AuditoriaSesion",
  "Cashflow",
  "CashflowLiquidacion",
  "CashflowPago",
  "CashflowRechazo",
  "CashflowTraspaso",
  "Conflicto",
  "ConflictoParte",
  "Fonograma",
  "FonogramaArchivo",
  "FonogramaEnvio",
  "FonogramaMaestro",
  "FonogramaParticipacion",
  "FonogramaTerritorio",
  "FonogramaTerritorioMaestro",
  "Productora",
  "ProductoraDocumento",
  "ProductoraDocumentoTipo",
  "ProductoraISRC",
  "ProductoraMensaje",
  "ProductoraPremio",
  "Usuario",
  "UsuarioMaestro",
  "UsuarioRol",
  "UsuarioVista",
  "UsuarioVistaMaestro",
];

class AuditoriaCambio extends Model {
  public id_auditoria!: string;
  public modelo!: string;
  public tipo_auditoria!: string;
  public detalle!: string;
  public usuario_originario_id!: string | null;
  public usuario_destino_id!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public registranteDeCambio?: Usuario;
  public usuarioAuditado?: Usuario;

  public static associations: {
    registranteDeCambio: Association<AuditoriaCambio, Usuario>;
    usuarioAuditado: Association<AuditoriaCambio, Usuario>;
  };
}

AuditoriaCambio.init(
  {
    id_auditoria: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID de auditoría debe ser un UUID válido.",
        },
      },
    },
    modelo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: {
          args: [ENTIDADES_PERMITIDAS],
          msg: `El modelo afectado debe ser uno de los siguientes: ${ENTIDADES_PERMITIDAS.join(
            ", "
          )}.`,
        },
      },
    },
    tipo_auditoria: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["ALTA", "BAJA", "CAMBIO", "ERROR", "SISTEMA", "AUTH"]],
          msg: "El tipo de auditoría debe ser uno de los siguientes: ALTA, BAJA, MODIFICACION, ERROR, SISTEMA, AUTH.",
        },
      },
    },
    detalle: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [0, 255],
          msg: "El detalle libre no puede exceder los 30 caracteres.",
        },
      },
    },
    usuario_originario_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: "id_usuario",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID del usuario originario debe ser un UUID válido.",
        },
      },
    },
    usuario_destino_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: "id_usuario",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID del usuario destino debe ser un UUID válido.",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "AuditoriaCambio",
    tableName: "AuditoriaCambio",
    timestamps: true,
    indexes: [
      {
        fields: ["usuario_originario_id"],
        name: "idx_auditoria_usuario_originario_id",
      },
      {
        fields: ["usuario_destino_id"],
        name: "idx_auditoria_usuario_destino_id",
      },
    ],
  }
);

export default AuditoriaCambio;
