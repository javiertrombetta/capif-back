import { Productora, ProductoraDocumento, ProductoraDocumentoTipo, ProductoraPremio } from '../models';

const seedProductoraData = async () => {
  try {
    // Obtener una productora existente
    const productora = await Productora.findOne({
      where: { nombre_productora: 'WARNER MUSIC ARGENTINA SA' },
    });

    if (!productora) {
      throw new Error('La productora WARNER MUSIC ARGENTINA SA no fue encontrada.');
    }

    // Buscar los tipos de documentos existentes
    const contratoSocial = await ProductoraDocumentoTipo.findOne({
      where: { nombre_documento: 'contrato_social' },
    });

    const comprobanteISRC = await ProductoraDocumentoTipo.findOne({
      where: { nombre_documento: 'comprobante_ISRC' },
    });

    if (!contratoSocial || !comprobanteISRC) {
      throw new Error('Los tipos de documento contrato_social o comprobante_ISRC no fueron encontrados.');
    }

    // Crear documentos para la productora con los tipos existentes
    await ProductoraDocumento.bulkCreate([
      {
        productora_id: productora.id_productora,
        tipo_documento_id: contratoSocial.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/contrato_social.pdf',
      },
      {
        productora_id: productora.id_productora,
        tipo_documento_id: comprobanteISRC.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/comprobante_ISRC.pdf',
      },
    ]);

    // Crear postulaciones para la productora
    const fechaAsignacion = new Date();

    await ProductoraPremio.bulkCreate([
      {
        productora_id: productora.id_productora,
        codigo_postulacion: 'POST001',
        fecha_asignacion: fechaAsignacion,
      },
      {
        productora_id: productora.id_productora,
        codigo_postulacion: 'POST002',
        fecha_asignacion: fechaAsignacion,
      },
    ]);

    console.log('productoras.seed completado con éxito.');

  } catch (error) {
    console.error('Error durante el seeding de productoras.seed: ', error);
  }
};

export default seedProductoraData;