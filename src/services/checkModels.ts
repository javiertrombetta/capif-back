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

export async function updatePorcentajeTitularidad(
  fonogramaId: string,
  FonogramaModel: any,
  FonogramaParticipacionModel: any
) {
  const fonograma = await FonogramaModel.findByPk(fonogramaId);
  if (fonograma) {
    const participaciones = await FonogramaParticipacionModel.findAll({
      where: { fonograma_id: fonogramaId },
    });

    const totalParticipacion = participaciones.reduce(
      (total: number, participacion: { porcentaje_participacion: number }) =>
        total + parseFloat(participacion.porcentaje_participacion.toString()),
      0
    );

    fonograma.porcentaje_titularidad_total = totalParticipacion;

    await fonograma.save();
  }
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


export async function actualizarDominioPublicoGlobal(FonogramaModel: any, FonogramaDatosModel: any) {
  const currentYear = new Date().getFullYear();
  const fonogramas = await FonogramaModel.findAll({
    include: [{ model: FonogramaDatosModel, as: 'datosFonograma' }],
  });

  for (const fonograma of fonogramas) {
    if (fonograma.datosFonograma) {
      const anioLanzamiento = fonograma.datosFonograma.anio_lanzamiento;
      const age = currentYear - anioLanzamiento;
      const nuevoEstadoDominioPublico = age > 70;

      if (fonograma.is_dominio_publico !== nuevoEstadoDominioPublico) {
        fonograma.is_dominio_publico = nuevoEstadoDominioPublico;
        await fonograma.save();
      }
    }
  }
}