import { Model } from 'sequelize';
import AuditoriaEntidad from '../models/AuditoriaEntidad';

/**
 * Registra un cambio de auditoría en la base de datos para cualquier cambio en una entidad.
 *
 * @param modelo - La instancia del modelo afectado.
 * @param tipoAuditoria - El tipo de auditoría: 'ALTA', 'BAJA' o 'CAMBIO'.
 * @param usuarioId - El ID del usuario que realiza la acción.
 * @param entidad - La entidad afectada, que debe estar entre las entidades permitidas.
 */
export async function registrarAuditoria(
  modelo: Model,
  tipoAuditoria: 'ALTA' | 'BAJA' | 'CAMBIO',
  usuarioId: string | null,
  entidad: string
) {
  const detalle = JSON.stringify(modelo.get({ plain: true })).slice(0, 30); // Limita el detalle a 30 caracteres

  await AuditoriaEntidad.create({
    usuario_registrante_id: usuarioId,
    entidad_afectada: entidad,
    tipo_auditoria: tipoAuditoria,
    detalle,
  });
}
