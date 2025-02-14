import {
  UsuarioRol,
  ProductoraDocumentoTipo,
  FonogramaTerritorio,
  UsuarioVista,
} from "../models";

const rolesData = [
  { nombre_rol: "admin_principal" },
  { nombre_rol: "admin_secundario" },
  { nombre_rol: "productor_principal" },
  { nombre_rol: "productor_secundario" },
  { nombre_rol: "usuario" },
];

const documentosData = [
  { nombre_documento: "dni_persona_fisica" },
  { nombre_documento: "dni_representante_legal" },
  { nombre_documento: "comprobante_ISRC" },
  { nombre_documento: "contrato_social" },
];

const paisesData = [
  { nombre_pais: "Paraguay", codigo_iso: "PY", is_activo: true },
  { nombre_pais: "Uruguay", codigo_iso: "UY", is_activo: true },
  { nombre_pais: "Brasil", codigo_iso: "BR", is_activo: true },
  { nombre_pais: "Guatemala", codigo_iso: "GT", is_activo: true },
  { nombre_pais: "Costa Rica", codigo_iso: "CR", is_activo: true },
  { nombre_pais: "El Salvador", codigo_iso: "SV", is_activo: true },
  { nombre_pais: "Panamá", codigo_iso: "PA", is_activo: true },
  { nombre_pais: "República Dominicana", codigo_iso: "DO", is_activo: true },
  { nombre_pais: "España", codigo_iso: "ES", is_activo: true },
  { nombre_pais: "India", codigo_iso: "IN", is_activo: true },
  { nombre_pais: "Italia", codigo_iso: "IT", is_activo: true },
  { nombre_pais: "Ucrania", codigo_iso: "UA", is_activo: true },
  { nombre_pais: "Colombia", codigo_iso: "CO", is_activo: false },
  { nombre_pais: "Chile", codigo_iso: "CL", is_activo: false },
  { nombre_pais: "Ecuador", codigo_iso: "EC", is_activo: false },
  { nombre_pais: "México", codigo_iso: "MX", is_activo: false },
  { nombre_pais: "Venezuela", codigo_iso: "VE", is_activo: false },
  { nombre_pais: "Estados Unidos", codigo_iso: "US", is_activo: false },
  { nombre_pais: "Gran Bretaña", codigo_iso: "GB", is_activo: false },
];

type VistaData = {
  nombre_vista: string;
  rol_id: string;
  nombre_vista_superior?: string | null;
};

 const vistasData = async (): Promise<VistaData[]> => {
  const roles = await UsuarioRol.findAll({
    attributes: ["id_rol", "nombre_rol"],
  });

  const vistas: VistaData[] = [];

  const agregarVistasPorRol = (
    nombreRol: string,
    vistasParaRol: { nombreVista: string; vistaSuperior?: string }[]
  ): void => {
    const rolId = roles.find((rol) => rol.nombre_rol === nombreRol)?.id_rol;
    if (!rolId) {
      throw new Error(`El rol '${nombreRol}' no fue encontrado.`);
    }

    vistasParaRol.forEach(({ nombreVista, vistaSuperior }) => {
      vistas.push({
        nombre_vista: nombreVista,
        nombre_vista_superior: vistaSuperior || null,
        rol_id: rolId,
      });
    });
  };

  agregarVistasPorRol("usuario", [
    { nombreVista: "Nueva productora" },
  ]);

  agregarVistasPorRol("admin_principal", [
    // { nombreVista: "Repertorio" },
    { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },
    { nombreVista: "Envío Archivo Audio", vistaSuperior: "Repertorio" },
    { nombreVista: "Territorialidad", vistaSuperior: "Repertorio" },

    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Habilitar Deshabilitar", vistaSuperior: "Usuarios" },

    // { nombreVista: "Cuentas Corrientes" },
    { nombreVista: "Liquidaciones", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Pagos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Traspasos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Rechazos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Estado de Cuenta", vistaSuperior: "Cuentas Corrientes" },

    // { nombreVista: "Auditoría" },
    { nombreVista: "Historial de Cambios", vistaSuperior: "Auditoría" },
    { nombreVista: "Cambios en Repertorios", vistaSuperior: "Auditoría" },
    { nombreVista: "Sesiones", vistaSuperior: "Auditoría" },
  ]);

  agregarVistasPorRol("admin_secundario", [
    // { nombreVista: "Repertorio" },
    { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },
    { nombreVista: "Envío Archivo Audio", vistaSuperior: "Repertorio" },
    { nombreVista: "Territorialidad", vistaSuperior: "Repertorio" },

    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Habilitar Deshabilitar", vistaSuperior: "Usuarios" },

    // { nombreVista: "Cuentas Corrientes" },
    { nombreVista: "Liquidaciones", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Pagos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Traspasos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Rechazos", vistaSuperior: "Cuentas Corrientes" },
    { nombreVista: "Estado de Cuenta", vistaSuperior: "Cuentas Corrientes" },

    // { nombreVista: "Auditoría" },
    { nombreVista: "Historial de Cambios", vistaSuperior: "Auditoría" },
    { nombreVista: "Cambios en Repertorios", vistaSuperior: "Auditoría" },
    { nombreVista: "Sesiones", vistaSuperior: "Auditoría" },
  ]);

  agregarVistasPorRol("productor_principal", [
    // { nombreVista: "Repertorio" },
    { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },

    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Habilitar Deshabilitar", vistaSuperior: "Usuarios" },

    // { nombreVista: "Cuentas Corrientes" },
    { nombreVista: "Estado de Cuenta", vistaSuperior: "Cuentas Corrientes" },
  ]);

  agregarVistasPorRol("productor_secundario", [
    // { nombreVista: "Repertorio" },
    { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },

    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },

    // { nombreVista: "Cuentas Corrientes" },
    { nombreVista: "Estado de Cuenta", vistaSuperior: "Cuentas Corrientes" },
  ]);

  return vistas;
};

const initSeed = async () => {
  try {
    // Insertar datos principales
    await UsuarioRol.bulkCreate(rolesData);
    await ProductoraDocumentoTipo.bulkCreate(documentosData);
    await FonogramaTerritorio.bulkCreate(paisesData);

    const vistas = await vistasData();
    await UsuarioVista.bulkCreate(vistas);

    console.log("[SEED] init.seed completado con éxito.");
  } catch (error) {
    console.error("Error al ejecutar init.seed:", error);
    throw error;
  }
};

export default initSeed;
