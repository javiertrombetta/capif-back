import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database/sequelize";
import Usuario from "./Usuario";
import Fonograma from "./Fonograma";

class AuditoriaRepertorio extends Model {
  public id_auditoria!: string;
  public usuario_registrante_id!: string | null;
  public fonograma_id!: string;  
  public tipo_auditoria!: string;
  public detalle!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public registranteDeRepertorio?: Usuario;
  public fonogramaAuditado?: Fonograma;  

  public static associations: {
    registranteDeRepertorio: Association<AuditoriaRepertorio, Usuario>;
    fonogramaAuditado: Association<AuditoriaRepertorio, Fonograma>;    
  };
}

AuditoriaRepertorio.init(
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
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Usuario,
        key: "id_usuario",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID del usuario registrante debe ser un UUID válido.",
        },
      },
    },
    fonograma_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Fonograma,
        key: "id_fonograma",
      },
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID del fonograma debe ser un UUID válido.",
        },
      },
    },
    tipo_auditoria: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: {
          args: [["ALTA", "BAJA", "CAMBIO", "ERROR", "SISTEMA"]],
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
  },
  {
    sequelize,
    modelName: "AuditoriaRepertorio",
    tableName: "AuditoriaRepertorio",
    timestamps: true,
    indexes: [
      { fields: ["usuario_registrante_id"], name: "idx_auditoria_repertorio_usuario_id" },
      { fields: ["fonograma_id"], name: "idx_auditoria_repertorio_fonograma_id" },
      { fields: ["tipo_auditoria"], name: "idx_auditoria_repertorio_tipo_auditoria" },
      { fields: ["createdAt"], name: "idx_auditoria_repertorio_created_at" },
    ],
  }
);

export default AuditoriaRepertorio;
