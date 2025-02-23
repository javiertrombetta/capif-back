import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  Conflicto,
  ConflictoParte,
  Fonograma,
  FonogramaParticipacion,
  Productora,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
} from "../models";

const seedConflictos = async () => {
  try {
    // Buscar la primera participación existente en un fonograma (WARNER)
    const participacionWarner = await FonogramaParticipacion.findOne();

    if (!participacionWarner) {
      throw new Error("No se encontró ninguna participación en un fonograma.");
    }

    // Obtener el fonograma al que pertenece esa participación
    const fonogramaEnConflicto = await Fonograma.findByPk(participacionWarner.fonograma_id, {
        include: [{ model: Productora, as: "productoraDelFonograma" }],
    });

    if (!fonogramaEnConflicto) {
        throw new Error("No se encontró el fonograma asociado a la participación de WARNER.");
    }

    console.log(`Usando el siguiente fonograma para generar un nuevo conflicto: ${fonogramaEnConflicto.titulo}`);

    console.log(`Participación existente de ${fonogramaEnConflicto.productoraDelFonograma?.nombre_productora} encontrada en ${fonogramaEnConflicto.titulo} con porcentaje: ${participacionWarner.porcentaje_participacion}%`);

    // Crear una nueva productora en conflicto
    const productoraConflicto = await Productora.create({
      nombre_productora: "UNIVERSAL MUSIC ARGENTINA S.A.",
      tipo_persona: "JURIDICA",
      cuit_cuil: "30715987465",
      razon_social: "UNIVERSAL MUSIC ARGENTINA SOCIEDAD ANONIMA",
      apellidos_representante: "GONZÁLEZ",
      nombres_representante: "MARCOS",
      cuit_representante: "20365987412",
      calle: "Av. Corrientes",
      numero: "987",
      ciudad: "CABA",
      localidad: "CABA",
      provincia: "Buenos Aires",
      codigo_postal: "1043",
      telefono: "01198765432",
      nacionalidad: "Argentina",
      alias_cbu: "universalcbu",
      cbu: "9988776655443322110099",
      email: "contacto@universalmusic.com.ar",
      fecha_alta: new Date(),
    });

    console.log(`Productora en conflicto creada: ${productoraConflicto.nombre_productora}`);

    // Crear usuario productor principal en conflicto
    const claveHash = await bcrypt.hash("conflicto", 10);
    const usuarioConflicto = await Usuario.create({
      email: "conflicto@productor.com",
      clave: claveHash,
      nombre: "Conflicto",
      apellido: "Productor",
      telefono: "01122334455",
      tipo_registro: "HABILITADO",
      rol_id: (await UsuarioRol.findOne({ where: { nombre_rol: "productor_principal" } }))?.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    console.log(`Usuario productor principal creado: ${usuarioConflicto.email} con clave conflicto`);

    // Asociar usuario con la productora en conflicto
    await UsuarioMaestro.create({
      usuario_id: usuarioConflicto.id_usuario,
      productora_id: productoraConflicto.id_productora,
    });

    console.log(`Usuario ${usuarioConflicto.email} asociado a productora: ${productoraConflicto.nombre_productora}`);

    // Definir el rango de fechas solapadas
    const fechaInicioUniversal = new Date("2024-04-01");
    const fechaFinUniversal = new Date("2024-12-31");

    // Calcular la participación de UNIVERSAL para que el total supere el 100%
    const participacionUniversal = Math.min(100 - participacionWarner.porcentaje_participacion + 10, 100);

    console.log(`Asignando a ${productoraConflicto.nombre_productora} un porcentaje de participación de: ${participacionUniversal}%`);

    // Insertar participación de UNIVERSAL en el fonograma
    const participacionUniversalRegistro = await FonogramaParticipacion.create({
      id_participacion: uuidv4(),
      fonograma_id: fonogramaEnConflicto.id_fonograma,
      productora_id: productoraConflicto.id_productora,
      fecha_participacion_inicio: fechaInicioUniversal,
      fecha_participacion_hasta: fechaFinUniversal,
      porcentaje_participacion: participacionUniversal,
    });

    console.log(`Participación de ${productoraConflicto.nombre_productora} en fonograma con ISRC ${fonogramaEnConflicto.isrc} creada`);

    // Calcular el porcentaje total en el solapamiento (abril - junio)
    const porcentajeTotal = participacionWarner.porcentaje_participacion + participacionUniversal;

    // Crear el conflicto porque el porcentaje total supera el 100% en el solapamiento entre abril y junio
    const conflicto = await Conflicto.create({
      id_conflicto: uuidv4(),
      fonograma_id: fonogramaEnConflicto.id_fonograma,
      productora_id: productoraConflicto.id_productora,
      estado_conflicto: "PRIMERA INSTANCIA",
      fecha_periodo_desde: new Date("2024-04-01"),
      fecha_periodo_hasta: new Date("2024-06-30"),
      porcentaje_periodo: porcentajeTotal, // WARNER + UNIVERSAL
      fecha_inicio_conflicto: new Date(),
    });

    console.log(`Conflicto registrado con ID: ${conflicto.id_conflicto}`);

    // Crear ConflictoParte para ambas participaciones en conflicto
    await ConflictoParte.bulkCreate([
      {
        id_conflicto_participacion: uuidv4(),
        conflicto_id: conflicto.id_conflicto,
        participacion_id: participacionUniversalRegistro.id_participacion,
        estado: "PENDIENTE",
        porcentaje_declarado: participacionUniversal,
        porcentaje_confirmado: null,
        is_documentos_enviados: false,
      },
      {
        id_conflicto_participacion: uuidv4(),
        conflicto_id: conflicto.id_conflicto,
        participacion_id: participacionWarner.id_participacion,
        estado: "PENDIENTE",
        porcentaje_declarado: participacionWarner.porcentaje_participacion,
        porcentaje_confirmado: null,
        is_documentos_enviados: false,
      },
    ]);

    console.log(`Se registraron las partes del conflicto en el fonograma con ISRC ${fonogramaEnConflicto.isrc}`);

    console.log("[SEED] conflicto.seed completado con éxito.");
  } catch (error) {
    console.error("Error durante el seeding de conflictos: ", error);
  }
};

export default seedConflictos;