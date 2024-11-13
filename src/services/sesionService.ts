// sesionService.ts
import AuditoriaSesion from '../models/AuditoriaSesion';

/**
 * Actualiza la fecha de fin de sesión para la sesión más reciente de un usuario.
 * @param userId - ID del usuario cuya sesión será actualizada.
 */
export const actualizarFechaFinSesion = async (userId: string): Promise<void> => {
  const sessionAudit = await AuditoriaSesion.findOne({
    where: { usuario_registrante_id: userId },
    order: [['fecha_inicio_sesion', 'DESC']], // Buscar la sesión más reciente
  });

  if (sessionAudit) {
    sessionAudit.fecha_fin_sesion = new Date();
    await sessionAudit.save();
  }
};
