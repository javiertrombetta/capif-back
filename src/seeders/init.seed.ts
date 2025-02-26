import bcrypt from "bcrypt";

import {
  Cashflow,
  FonogramaTerritorio,
  Productora,
  ProductoraDocumentoTipo,
  Usuario,
  UsuarioRol,
  UsuarioVista, 
  UsuarioVistaMaestro,
} from "../models";

const createAdminPrincipal = async () => {
  try {
    const adminRole = await UsuarioRol.findOne({ where: { nombre_rol: "admin_principal" } });

    if (!adminRole) {
      throw new Error("El rol admin_principal no está definido en la base de datos.");
    }

    if (!process.env.ADMIN_PRINCIPAL_EMAIL || !process.env.ADMIN_PRINCIPAL_PASSWORD) {
      throw new Error("Las variables ADMIN_PRINCIPAL_EMAIL y ADMIN_PRINCIPAL_PASSWORD deben estar definidas en el .env.");
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.ADMIN_PRINCIPAL_EMAIL)) {
      throw new Error("El email definido en ADMIN_PRINCIPAL_EMAIL no es válido.");
    }

    let adminUser = await Usuario.findOne({ where: { email: process.env.ADMIN_PRINCIPAL_EMAIL } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PRINCIPAL_PASSWORD, 10);

      adminUser = await Usuario.create({
        nombre: "Administrador",
        apellido: "Principal",
        email: process.env.ADMIN_PRINCIPAL_EMAIL,
        clave: hashedPassword,
        tipo_registro: "HABILITADO",
        is_bloqueado: false,
        intentos_fallidos: 0,
        fecha_ultimo_cambio_registro: new Date(),
        rol_id: adminRole.id_rol,
      });

      console.log("Administrador Principal para CAPIF creado correctamente.");
    } else {
      console.log("El usuario Administrador Principal para CAPIF ya existe.");
    }

    // Asociar vistas de admin_principal al usuario
    const vistasAdmin = await UsuarioVista.findAll({
      where: { rol_id: adminRole.id_rol },
    });

    if (vistasAdmin.length > 0) {
      for (const vista of vistasAdmin) {
        await UsuarioVistaMaestro.findOrCreate({
          where: {
            usuario_id: adminUser.id_usuario,
            vista_id: vista.id_vista,
          },
          defaults: {
            usuario_id: adminUser.id_usuario,
            vista_id: vista.id_vista,
            is_habilitado: true,
          },
        });
      }

      console.log(`Vistas de admin_principal asociadas a ${adminUser.email} correctamente.`);
    } else {
      console.warn("No se encontraron vistas para admin_principal.");
    }

  } catch (error) {
    console.error("Error al crear el usuario Administrador Principal para CAPIF:", error);
  }
};

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

const productorasIniciales = [
  {
    nombre_productora: "No Asignados",
    tipo_persona: "FISICA",
    cuit_cuil: "00000000000",
    email: "noasignados@capif.org",
    calle: "No Asignado",
    numero: "0",
    ciudad: "No Asignado",
    localidad: "No Asignado",
    provincia: "No Asignado",
    codigo_postal: "0000",
    telefono: "0000000000",
    nacionalidad: "No Asignado",
    alias_cbu: "noasignados",
    cbu: "0000000000000000000000",
    cantidad_fonogramas: 0,
    razon_social: null,
    apellidos_representante: null,
    nombres_representante: null,
    cuit_representante: null,
  },
  {
    nombre_productora: "Conflictos",
    tipo_persona: "FISICA",
    cuit_cuil: "99999999999",
    email: "conflictos@capif.org",
    calle: "Conflicto",
    numero: "0",
    ciudad: "Conflicto",
    localidad: "Conflicto",
    provincia: "Conflicto",
    codigo_postal: "9999",
    telefono: "9999999999",
    nacionalidad: "Conflicto",
    alias_cbu: "conflictos",
    cbu: "9999999999999999999999",
    cantidad_fonogramas: 0,
    razon_social: null,
    apellidos_representante: null,
    nombres_representante: null,
    cuit_representante: null,
  }
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
    // { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Declaración Bulk Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },
    { nombreVista: "Envío Archivo Audio", vistaSuperior: "Repertorio" },
    { nombreVista: "Territorialidad", vistaSuperior: "Repertorio" },
    { nombreVista: "Ver Titularidad", vistaSuperior: "Repertorio" },
    { nombreVista: "Crear Titularidad", vistaSuperior: "Repertorio" },
    { nombreVista: "Editar Titularidad", vistaSuperior: "Repertorio" },

    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },
    { nombreVista: "Filtrar Premios Gardel", vistaSuperior: "Productoras" },
    { nombreVista: "Crear Postulaciones", vistaSuperior: "Productoras" },
    { nombreVista: "Purgar Postulaciones", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Desvincular Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Editar Datos Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Bloquear Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Restablecer Password Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Editar Vistas Usuario", vistaSuperior: "Usuarios" },


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
    // { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Declaración Bulk Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },
    { nombreVista: "Envío Archivo Audio", vistaSuperior: "Repertorio" },
    { nombreVista: "Territorialidad", vistaSuperior: "Repertorio" },
    { nombreVista: "Ver Titularidad", vistaSuperior: "Repertorio" },


    // { nombreVista: "Productoras" },
    { nombreVista: "Buscar Productora", vistaSuperior: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },
    { nombreVista: "Filtrar Premios Gardel", vistaSuperior: "Productoras" },
    { nombreVista: "Crear Postulaciones", vistaSuperior: "Productoras" },
    { nombreVista: "Purgar Postulaciones", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Desvincular Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Editar Datos Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Bloquear Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Restablecer Password Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Editar Vistas Usuario", vistaSuperior: "Usuarios" },


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
    { nombreVista: "Ver Titularidad", vistaSuperior: "Repertorio" },


    // { nombreVista: "Productoras" },
    { nombreVista: "Premios Gardel", vistaSuperior: "Productoras" },

    // { nombreVista: "Usuarios" },
    { nombreVista: "Buscar Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Alta Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Desvincular Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Restablecer Password Usuario", vistaSuperior: "Usuarios" },
    { nombreVista: "Editar Vistas Usuario", vistaSuperior: "Usuarios" },


    // { nombreVista: "Cuentas Corrientes" },
    { nombreVista: "Estado de Cuenta", vistaSuperior: "Cuentas Corrientes" },
  ]);

  agregarVistasPorRol("productor_secundario", [
    // { nombreVista: "Repertorio" },
    { nombreVista: "Declaración Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Buscar Repertorio", vistaSuperior: "Repertorio" },
    { nombreVista: "Conflictos", vistaSuperior: "Repertorio" },
    { nombreVista: "Ver Titularidad", vistaSuperior: "Repertorio" },


    // { nombreVista: "Productoras" },
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

    await createAdminPrincipal();

    // Insertar productoras iniciales
    for (const data of productorasIniciales) {
      const [productora, created] = await Productora.findOrCreate({
        where: { cuit_cuil: data.cuit_cuil },
        defaults: data,
      });

      if (created) {
        console.log(`Productora creada: ${productora.nombre_productora}`);
      } else {
        console.log(`Productora ya existente: ${productora.nombre_productora}`);
      }

      // Crear cashflow asociado si no existe
      await Cashflow.findOrCreate({
        where: { productora_id: productora.id_productora },
        defaults: {
          productora_id: productora.id_productora,
          saldo_actual_productora: 0,
        },
      });
    }

    console.log("[SEED] init.seed completado con éxito.");
  } catch (error) {
    console.error("Error al ejecutar init.seed:", error);
    throw error;
  }
};

export default initSeed;
