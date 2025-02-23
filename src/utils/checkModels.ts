import { AuditoriaCambio, Fonograma } from "../models";

export function validateCUIT(cuit: string): string | true {
  if (cuit.length !== 11) {
    return 'El CUIT/CUIL debe tener exactamente 11 dígitos.';
  }

  const validPrefixes = ['20', '23', '24', '27', '30', '33'];
  if (!validPrefixes.includes(cuit.slice(0, 2))) {
    return 'El CUIT/CUIL debe comenzar con un prefijo válido (20, 23, 24, 27, 30 o 33).';
  }

  const codes = '6789456789';
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cuit[i]) * parseInt(codes[i]);
  }

  const verificador = parseInt(cuit[10]);
  const resultado = sum % 11;

  if (resultado !== verificador) {
    return 'El CUIT/CUIL no es válido según el dígito verificador.';
  }

  return true;
}

export function validateCBU(value: string): string | true {
  const bankCodeSection = value.slice(0, 8);
  const accountNumberSection = value.slice(8, 22);

  const validateSection = (section: string, weights: number[]): boolean => {
    let sum = 0;
    for (let i = 0; i < section.length - 1; i++) {
      sum += parseInt(section[i]) * weights[i % weights.length];
    }
    const verificationDigit = (10 - (sum % 10)) % 10;
    return verificationDigit === parseInt(section.slice(-1));
  };

  const weights = [7, 1, 3];

  if (!validateSection(bankCodeSection, weights)) {
    return 'La primera parte del CBU es inválida según el dígito verificador.';
  }

  if (!validateSection(accountNumberSection, weights)) {
    return 'La segunda parte del CBU es inválida según el dígito verificador.';
  }

  return true;
}

export function calculateLoteAndOrdenPago(lastLote: number | null, lastOrdenCount: number) {
  const currentLote = lastLote !== null ? lastLote + 1 : 1;
  const ordenPago = lastOrdenCount + 1;

  return { currentLote, ordenPago };
}

export async function updateConflictosActivos(fonogramaId: string, ConflictoModel: any, FonogramaModel: any) {
  const conflictosActivosCount = await ConflictoModel.count({
    where: { fonograma_id: fonogramaId, fecha_fin_conflicto: null }
  });

  const fonograma = await FonogramaModel.findByPk(fonogramaId);
  if (fonograma) {
    fonograma.cantidad_conflictos_activos = conflictosActivosCount;
    await fonograma.save();
  }
}

export async function actualizarDominioPublicoGlobal(
  FonogramaModel: typeof Fonograma,
  AuditoriaCambioModel: typeof AuditoriaCambio
) {
  const currentYear = new Date().getFullYear();

  // Obtener todos los fonogramas que potencialmente necesiten actualización
  const fonogramas = await FonogramaModel.findAll({
    attributes: ['id_fonograma', 'anio_lanzamiento', 'is_dominio_publico'],
  });

  const actualizaciones = fonogramas
    .filter((fonograma) => {
      const anioLanzamiento = fonograma.anio_lanzamiento;
      const age = currentYear - anioLanzamiento;
      const nuevoEstadoDominioPublico = age > 70;
      return fonograma.is_dominio_publico !== nuevoEstadoDominioPublico;
    })
    .map((fonograma) => ({
      id_fonograma: fonograma.id_fonograma,
      is_dominio_publico: currentYear - fonograma.anio_lanzamiento > 70,
    }));

  if (actualizaciones.length === 0) {
    return;
  }

  for (const actualizacion of actualizaciones) {
    await FonogramaModel.update(
      { is_dominio_publico: actualizacion.is_dominio_publico },
      { where: { id_fonograma: actualizacion.id_fonograma } }
    );

    // Registrar cambio en auditoría con el modelo pasado como argumento
    await AuditoriaCambioModel.create({
      usuario_originario_id: null,
      usuario_destino_id: null,
      modelo: "Fonograma",
      tipo_auditoria: "SISTEMA",
      detalle: `El fonograma con ID ${actualizacion.id_fonograma} cambió su estado de dominio público a ${
        actualizacion.is_dominio_publico ? "Sí" : "No"
      }`,      
    });
  }
}