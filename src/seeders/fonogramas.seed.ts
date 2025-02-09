import { v4 as uuidv4 } from "uuid";
import { Fonograma, FonogramaEnvio, FonogramaMaestro, FonogramaParticipacion, FonogramaTerritorio, FonogramaTerritorioMaestro, Productora, ProductoraISRC } from "../models";

const generateISRC = async (productoraId: string): Promise<string> => {
  // Obtener código de productora de tipo AUDIO
  const productoraISRC = await ProductoraISRC.findOne({
    where: { productora_id: productoraId, tipo: "AUDIO" },
  });

  if (!productoraISRC) {
    throw new Error(`No se encontró código ISRC para la productora ${productoraId}`);
  }

  // Obtener los dos últimos dígitos del año en curso
  const currentYear = new Date().getFullYear().toString().slice(-2);

  // Contar cuántos fonogramas tiene esta productora para generar el número correlativo
  const totalFonogramas = await Fonograma.count({ where: { productora_id: productoraId } });
  const numeroCorrelativo = (totalFonogramas + 1).toString().padStart(5, "0");

  // Generar el ISRC
  return `AR${productoraISRC.codigo_productora}${currentYear}${numeroCorrelativo}`;
};

const generateRandomPercentage = () => Math.floor(Math.random() * 101) + 1;

const seedFonogramas = async () => {
  try {
    // Buscar la productora "WARNER MUSIC ARGENTINA SA"
    const productora = await Productora.findOne({
      where: { nombre_productora: "WARNER MUSIC ARGENTINA S.A." },
    });

    if (!productora) {
      throw new Error("La productora WARNER MUSIC ARGENTINA S.A. no fue encontrada.");
    }

    // Obtener territorios habilitados
    const territorios = await FonogramaTerritorio.findAll({
      where: { is_habilitado: true },
    });

    if (territorios.length === 0) {
      throw new Error("No se encontraron territorios habilitados.");
    }

    // Datos de fonogramas (sin ISRC aún)
    const fonogramasData = [
      { titulo: "Canción Uno", artista: "Artista Uno", album: "Álbum Uno", duracion: "00:03:45", sello_discografico: "Sello Uno", anio_lanzamiento: 2024 },
      { titulo: "Canción Dos", artista: "Artista Dos", album: "Álbum Dos", duracion: "00:04:10", sello_discografico: "Sello Dos", anio_lanzamiento: 2024 },
      { titulo: "Canción Tres", artista: "Artista Tres", album: "Álbum Tres", duracion: "00:02:55", sello_discografico: "Sello Tres", anio_lanzamiento: 2024 },
      { titulo: "Canción Cuatro", artista: "Artista Cuatro", album: "Álbum Cuatro", duracion: "00:03:20", sello_discografico: "Sello Cuatro", anio_lanzamiento: 2024 },
      { titulo: "Canción Cinco", artista: "Artista Cinco", album: "Álbum Cinco", duracion: "00:03:55", sello_discografico: "Sello Cinco", anio_lanzamiento: 2024 },
    ];

    // Insertar fonogramas con ISRC generado
    for (const data of fonogramasData) {
      const isrc = await generateISRC(productora.id_productora);
      const fonogramaId = uuidv4();
      const participacion = generateRandomPercentage();

      await Fonograma.create({
        id_fonograma: fonogramaId,
        productora_id: productora.id_productora,
        estado_fonograma: "ACTIVO",
        isrc,
        titulo: data.titulo,
        artista: data.artista,
        album: data.album,
        duracion: data.duracion,
        sello_discografico: data.sello_discografico,
        anio_lanzamiento: data.anio_lanzamiento,
        is_dominio_publico: false,
        cantidad_conflictos_activos: 0,
        porcentaje_titularidad_total: participacion,
        archivo_audio_id: null,
        envio_vericast_id: null,
      });

      // Registrar en FonogramaEnvio con la fecha de hoy
      await FonogramaEnvio.create({
        id_envio_vericast: uuidv4(),
        fonograma_id: fonogramaId,
        tipo_estado: "PENDIENTE DE ENVIO",
        fecha_envio_inicial: new Date(),
        fecha_envio_ultimo: new Date(),
      });

      // Crear entrada en FonogramaMaestro con operación ALTA
      await FonogramaMaestro.create({
        id_fonograma_maestro: uuidv4(),
        fonograma_id: fonogramaId,
        operacion: "ALTA",
        fecha_operacion: new Date(),
        isProcesado: true,
      });

      // Crear la participación de la productora en el fonograma creado
      await FonogramaParticipacion.create({
        id_participacion: uuidv4(),
        fonograma_id: fonogramaId,
        productora_id: productora.id_productora,
        fecha_participacion_inicio: new Date(),
        fecha_participacion_hasta: new Date("2099-12-31"),
        porcentaje_participacion: participacion,
      });

      // Asignar todos los territorios habilitados al fonograma
      for (const territorio of territorios) {
        await FonogramaTerritorioMaestro.create({
          id_territorio_maestro: uuidv4(),
          fonograma_id: fonogramaId,
          territorio_id: territorio.id_territorio,
          is_activo: true,
        });
      }

      console.log(`Fonograma creado: ${data.titulo} - ISRC: ${isrc} con operación ALTA, participación, territorios y envío registrado.`);
    }

    console.log("Se insertaron correctamente 5 fonogramas para WARNER MUSIC ARGENTINA S.A.");
    console.log('[SEED] fonogramas.seed completado con éxito.');
  } catch (error) {
    console.error("Error durante el seeding de fonogramas: ", error);
  }
};

export default seedFonogramas;