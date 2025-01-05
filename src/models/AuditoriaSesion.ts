import { Model, DataTypes, Association } from "sequelize";
import sequelize from "../config/database/sequelize";
import Usuario from "./Usuario";

class AuditoriaSesion extends Model {
  public id_sesion!: string;
  public usuario_registrante_id!: string;
  public ip_origen!: string;
  public navegador!: string;
  public fecha_inicio_sesion!: Date;
  public fecha_fin_sesion!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public registranteDeSesion?: Usuario;

  public static associations: {
    registranteDeSesion: Association<AuditoriaSesion, Usuario>;
  };
}

AuditoriaSesion.init(
  {
    id_sesion: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      validate: {
        isUUID: {
          args: 4,
          msg: "El ID de la sesión debe ser un UUID válido.",
        },
      },
    },
    usuario_registrante_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    ip_origen: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: {
          msg: "La dirección IP debe ser válida.",
        },
      },
    },
    navegador: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [0, 255],
          msg: "El navegador no puede exceder los 50 caracteres.",
        },
      },
    },
    fecha_inicio_sesion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: "La fecha de inicio debe ser una fecha válida.",
        },
      },
    },
    fecha_fin_sesion: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: {
          args: true,
          msg: "La fecha de fin debe ser una fecha válida.",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "AuditoriaSesion",
    tableName: "AuditoriaSesion",
    timestamps: true,
    indexes: [
      {
        fields: ["usuario_registrante_id"],
        name: "idx_auditoria_sesion_usuario_registrante_id",
      },
    ],
  }
);

export default AuditoriaSesion;
