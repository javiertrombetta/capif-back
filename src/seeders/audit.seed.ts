import { AuditoriaCambio, AuditoriaRepertorio, AuditoriaSesion, Usuario, Fonograma } from "../models";

const seedAuditData = async () => {
  try {
    // Obtener usuarios y fonogramas de la base de datos
    const usuarios = await Usuario.findAll();
    const fonogramas = await Fonograma.findAll();

    if (usuarios.length === 0) {
      throw new Error("No se encontraron usuarios en la base de datos.");
    }

    if (fonogramas.length === 0) {
      throw new Error("No se encontraron fonogramas en la base de datos.");
    }

    console.log(`Se encontraron ${usuarios.length} usuarios y ${fonogramas.length} fonogramas.`);

    const usuarioAdmin = usuarios[0];
    const usuarioRegular = usuarios.length > 1 ? usuarios[1] : usuarios[0];
    const fonogramaEjemplo = fonogramas[0];

    // Auditoría de cambios
    await AuditoriaCambio.bulkCreate([
      {
        modelo: "Usuario",
        tipo_auditoria: "ALTA",
        detalle: "Se creó un nuevo usuario en el sistema.",
        usuario_originario_id: usuarioAdmin.id_usuario,
        usuario_destino_id: usuarioRegular.id_usuario,
      },
      {
        modelo: "Cashflow",
        tipo_auditoria: "CAMBIO",
        detalle: "Se actualizó el saldo de una cuenta de cashflow.",
        usuario_originario_id: usuarioAdmin.id_usuario,
        usuario_destino_id: null,
      },
      {
        modelo: "Productora",
        tipo_auditoria: "BAJA",
        detalle: "Se eliminó una productora.",
        usuario_originario_id: usuarioAdmin.id_usuario,
        usuario_destino_id: null,
      },
    ]);

    console.log("Registros de AuditoriaCambio insertados correctamente.");

    // Auditoría de repertorio
    await AuditoriaRepertorio.bulkCreate([
      {
        usuario_registrante_id: usuarioRegular.id_usuario,
        fonograma_id: fonogramaEjemplo.id_fonograma,
        tipo_auditoria: "ALTA",
        detalle: "Nuevo fonograma registrado en el sistema.",
      },
      {
        usuario_registrante_id: usuarioRegular.id_usuario,
        fonograma_id: fonogramaEjemplo.id_fonograma,
        tipo_auditoria: "CAMBIO",
        detalle: "Actualización de datos en el fonograma.",
      },
    ]);

    console.log("Registros de AuditoriaRepertorio insertados correctamente.");

    // Auditoría de sesión
    await AuditoriaSesion.bulkCreate([
      {
        usuario_registrante_id: usuarioAdmin.id_usuario,
        ip_origen: "192.168.1.10",
        navegador: "Google Chrome",
        fecha_inicio_sesion: new Date(),
        fecha_fin_sesion: null,
      },
      {
        usuario_registrante_id: usuarioRegular.id_usuario,
        ip_origen: "203.0.113.42",
        navegador: "Mozilla Firefox",
        fecha_inicio_sesion: new Date(),
        fecha_fin_sesion: new Date(),
      },
    ]);

    console.log("Registros de AuditoriaSesion insertados correctamente.");

    console.log("[SEED] audit.seed completado con éxito.");
  } catch (error) {
    console.error("Error durante el seeding de auditoría:", error);
  }
};

export default seedAuditData;