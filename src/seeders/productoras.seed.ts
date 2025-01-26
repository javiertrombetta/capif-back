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

    // Crear tipos de documentos si no existen
    const tipoDocumento1 = await ProductoraDocumentoTipo.findOrCreate({
      where: { nombre_documento: 'Contrato' },
      defaults: {
        nombre_documento: 'Contrato',
      },
    });

    const tipoDocumento2 = await ProductoraDocumentoTipo.findOrCreate({
      where: { nombre_documento: 'Licencia' },
      defaults: {
        nombre_documento: 'Licencia',
      },
    });

    // Crear documentos para la productora
    await ProductoraDocumento.bulkCreate([
      {
        productora_id: productora.id_productora,
        tipo_documento_id: tipoDocumento1[0].id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/contrato.pdf',
      },
      {
        productora_id: productora.id_productora,
        tipo_documento_id: tipoDocumento2[0].id_documento_tipo,
        ruta_archivo_documento: 'https://example.com/documentos/licencia.pdf',
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