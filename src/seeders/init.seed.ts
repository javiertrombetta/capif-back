import sequelize from '../config/database/sequelize';
import { UsuarioRolTipo, ProductoraISRCTipo, ProductoraDocumentoTipo, FonogramaPaisTipo }from '../models'

const rolesData = [
  { nombre_rol: 'admin_principal' },
  { nombre_rol: 'admin_secundario' },
  { nombre_rol: 'productor_principal' },
  { nombre_rol: 'productor_secundario' },
];

const documentosData = [
  { nombre_documento: 'dni_persona_fisica' },
  { nombre_documento: 'dni_representante_legal' },
  { nombre_documento: 'comprobante_ISRC' },
  { nombre_documento: 'contrato_social' },
];

const paisesData = [
  { nombre_pais: 'Paraguay', codigo_iso: 'PY', is_activo: true },
  { nombre_pais: 'Uruguay', codigo_iso: 'UY', is_activo: true },
  { nombre_pais: 'Brasil', codigo_iso: 'BR', is_activo: true },
  { nombre_pais: 'Guatemala', codigo_iso: 'GT', is_activo: true },
  { nombre_pais: 'Costa Rica', codigo_iso: 'CR', is_activo: true },
  { nombre_pais: 'El Salvador', codigo_iso: 'SV', is_activo: true },
  { nombre_pais: 'Panamá', codigo_iso: 'PA', is_activo: true },
  { nombre_pais: 'República Dominicana', codigo_iso: 'DO', is_activo: true },
  { nombre_pais: 'España', codigo_iso: 'ES', is_activo: true },
  { nombre_pais: 'India', codigo_iso: 'IN', is_activo: true },
  { nombre_pais: 'Italia', codigo_iso: 'IT', is_activo: true },
  { nombre_pais: 'Ucrania', codigo_iso: 'UA', is_activo: true },
  { nombre_pais: 'Colombia', codigo_iso: 'CO', is_activo: false },
  { nombre_pais: 'Chile', codigo_iso: 'CL', is_activo: false },
  { nombre_pais: 'Ecuador', codigo_iso: 'EC', is_activo: false },
  { nombre_pais: 'México', codigo_iso: 'MX', is_activo: false },
  { nombre_pais: 'Venezuela', codigo_iso: 'VE', is_activo: false },
  { nombre_pais: 'Estados Unidos', codigo_iso: 'US', is_activo: false },
  { nombre_pais: 'Gran Bretaña', codigo_iso: 'GB', is_activo: false },
];

// Función para cargar completamente todo el pool disponible en ProductoraISRCTipo
async function populateISRCCodePool() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codes = [];

  for (const char1 of chars) {
    for (const char2 of chars) {
      for (const char3 of chars) {
        codes.push({ codigo: `${char1}${char2}${char3}`, is_en_uso: false });
      }
    }
  }

  await ProductoraISRCTipo.bulkCreate(codes, { ignoreDuplicates: true });
}

async function initSeed() {
  try {
    await sequelize.sync();

    // UsuarioRolTipo
    await UsuarioRolTipo.bulkCreate(rolesData, { ignoreDuplicates: true });

    // ProductoraDocumentoTipo
    await ProductoraDocumentoTipo.bulkCreate(documentosData, { ignoreDuplicates: true });

    // FonogramaPaisTipo
    await FonogramaPaisTipo.bulkCreate(paisesData, { ignoreDuplicates: true });

    // ProductoraISRCTipo
    await populateISRCCodePool();

    console.log('Se completó la carga inicial con los datos de seed.');
  } catch (error) {
    console.error('Error al realizar el seed:', error);
  } finally {
    await sequelize.close();
  }
}

initSeed();
