import { Productora, ProductoraDocumento, ProductoraDocumentoTipo, ProductoraPremio } from '../models';

const seedProductoraData = async () => {
  try {
    // Obtener las productoras existentes
    const productoraWarner = await Productora.findOne({
      where: { nombre_productora: 'WARNER MUSIC ARGENTINA S.A.' },
    });

    const productoraSony = await Productora.findOne({
      where: { nombre_productora: 'SONY MUSIC ENTERTAINMENT ARGENTINA S.A.' },
    });

    if (!productoraWarner || !productoraSony) {
      throw new Error('No se encontraron todas las productoras requeridas (WARNER y SONY).');
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

    // Crear documentos para ambas productoras
    await ProductoraDocumento.bulkCreate([
      {
        productora_id: productoraWarner.id_productora,
        tipo_documento_id: contratoSocial.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/warner_contrato_social.pdf',
      },
      {
        productora_id: productoraWarner.id_productora,
        tipo_documento_id: comprobanteISRC.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/warner_comprobante_ISRC.pdf',
      },
      {
        productora_id: productoraSony.id_productora,
        tipo_documento_id: contratoSocial.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/sony_contrato_social.pdf',
      },
      {
        productora_id: productoraSony.id_productora,
        tipo_documento_id: comprobanteISRC.id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/sony_comprobante_ISRC.pdf',
      },
    ]);

    console.log('Documentos asignados a WARNER MUSIC y SONY MUSIC ENTRETAINMENT.');

    // Crear postulaciones solo para WARNER
    const fechaAsignacion = new Date();

    await ProductoraPremio.bulkCreate([
      {
        productora_id: productoraWarner.id_productora,
        codigo_postulacion: 'POST001',
        fecha_asignacion: fechaAsignacion,
      },
      {
        productora_id: productoraWarner.id_productora,
        codigo_postulacion: 'POST002',
        fecha_asignacion: fechaAsignacion,
      },
    ]);

    console.log('Premios creados: POST001 y POST002 para WARNER MUSIC ARGENTINA S.A.');
    console.log('[SEED] productoras.seed completado con éxito.');

  } catch (error) {
    console.error('Error durante el seeding de productoras.seed: ', error);
  }
};

export default seedProductoraData;