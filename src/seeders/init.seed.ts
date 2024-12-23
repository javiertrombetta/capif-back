import { UsuarioRol, ProductoraDocumentoTipo, FonogramaTerritorio }from '../models'

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

const initSeed = async () => {
  try {
    console.log('Ejecutando seeders...');

    await UsuarioRol.bulkCreate(rolesData, { ignoreDuplicates: true});
    await ProductoraDocumentoTipo.bulkCreate(documentosData, { ignoreDuplicates: true});
    await FonogramaTerritorio.bulkCreate(paisesData, { ignoreDuplicates: true});

    console.log('Seed completado con éxito.');
  } catch (error) {
    console.error('Error al realizar el seed:', error);
    throw error;
  }
};

export default initSeed;
