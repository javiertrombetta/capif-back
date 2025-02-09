import bcrypt from 'bcrypt';
import { generarCodigosISRC } from '../services/productoraService';
import { Usuario, Productora, UsuarioMaestro, UsuarioVista, UsuarioVistaMaestro, UsuarioRol } from '../models';

// Datos iniciales
const usuariosData = [
  {
    nombreRol: 'productor_principal',
    email: 'principal@productor.com',
    clave: 'productorprincipal',
    nombre: 'Productor',
    apellido: 'Principal',
    telefono: '1123456789',
  },
  {
    nombreRol: 'productor_secundario',
    email: 'secundario@productor.com',
    clave: 'productorsecundario',
    nombre: 'Productor',
    apellido: 'Secundario',
    telefono: '1123456789',
  },
  {
    nombreRol: 'admin_principal',
    email: 'principal@admin.com',
    clave: 'adminprincipal',
    nombre: 'Admin',
    apellido: 'Principal',
    telefono: '1123456789',
  },
  {
    nombreRol: 'admin_secundario',
    email: 'secundario@admin.com',
    clave: 'adminsecundario',
    nombre: 'Admin',
    apellido: 'Secundario',
    telefono: '1123456789',
  },
];

const seedUsuarios = async () => {
  try {
    // Crear Productora para productor_principal
    const productoraActiva = await Productora.create({
      nombre_productora: 'WARNER MUSIC ARGENTINA S.A.',
      tipo_persona: 'JURIDICA',
      cuit_cuil: '30601412620',
      razon_social: 'WARNER MUSIC ARGENTINA SOCIEDAD ANONIMA',
      apellidos_representante: 'ESCALERA',
      nombres_representante: 'RODRIGO',
      cuit_representante: '20365498712',
      calle: 'Av. Calle Falsa',
      numero: '123',
      ciudad: 'Buenos Aires',
      localidad: 'Palermo',
      provincia: 'Buenos Aires',
      codigo_postal: '1425',
      telefono: '01112345678',
      nacionalidad: 'Argentina',
      alias_cbu: 'principalcbu',
      cbu: '1123456789123456789012',
      email: 'contacto@warnermusic.com.ar',
      fecha_alta: new Date(),
    });

    console.log(`Productora creada y AUTORIZADA: ${productoraActiva.nombre_productora}`);

    const productoraPendiente = await Productora.create({
      nombre_productora: 'SONY MUSIC ENTERTAINMENT ARGENTINA S.A.',
      tipo_persona: 'JURIDICA',
      cuit_cuil: '30686513528',
      razon_social: 'SONY MUSIC ENTERTAINMENT ARGENTINA SOCIEDAD ANONIMA',
      apellidos_representante: 'SUAREZ LISSI',
      nombres_representante: 'TOMÁS',
      cuit_representante: '20321456987',
      calle: 'Calle Nueva 456',
      numero: '456',
      ciudad: 'Córdoba',
      localidad: 'Centro',
      provincia: 'Córdoba',
      codigo_postal: '5000',
      telefono: '03511234567',
      nacionalidad: 'Argentina',
      alias_cbu: 'nuevacbu',
      cbu: '9876543210987654321098',
      email: 'contacto@sonymusic.com.ar',
      fecha_alta: null,
    });

    console.log(`Productora creada y PENDIENTE: ${productoraPendiente.nombre_productora}`);

    // Generar códigos ISRC para la productora
    const isrcCodes = await generarCodigosISRC(productoraActiva.id_productora);
    console.log('Códigos ISRC generados para la productora:', isrcCodes);

    // Procesar usuarios
    for (const usuario of usuariosData) {
      const { nombreRol, email, clave, nombre, apellido, telefono } = usuario;

      // Buscar el rol asociado
      const rol = await UsuarioRol.findOne({ where: { nombre_rol: nombreRol } });
      if (!rol) throw new Error(`Rol '${nombreRol}' no encontrado`);

      // Encriptar clave
      const claveHash = await bcrypt.hash(clave, 10);

      // Crear usuario
      const usuarioHabilitado = await Usuario.create({
        email,
        clave: claveHash,
        nombre,
        apellido,
        telefono,
        tipo_registro: 'HABILITADO',
        rol_id: rol.id_rol,
        fecha_ultimo_cambio_rol: new Date(),
      });
 
      console.log(`Usuario creado: ${email} con clave ${clave}`);

      if(rol.nombre_rol == 'productor_principal' || rol.nombre_rol == 'productor_secundario'){
        // Asociar con la productora principal
        await UsuarioMaestro.create({
          usuario_id: usuarioHabilitado.id_usuario,
          productora_id: productoraActiva.id_productora,
        });
      }

      // Buscar vistas asociadas al rol del usuario
      const vistas = await UsuarioVista.findAll({ where: { rol_id: rol.id_rol } });

      // Asociar vistas al usuario
      await UsuarioVistaMaestro.bulkCreate(
        vistas.map((vista) => ({
          usuario_id: usuarioHabilitado.id_usuario,
          vista_id: vista.id_vista,
          is_habilitado: true,
        }))
      );
    }

    // Crear usuario productor_principal en estado PENDIENTE para la nueva productora
    const claveHashPendiente = await bcrypt.hash('productorpendiente', 10);
    const usuarioPendiente = await Usuario.create({
      email: 'pendiente@productor.com',
      clave: claveHashPendiente,
      nombre: 'Pendiente',
      apellido: 'Productor',
      telefono: '03511234567',
      tipo_registro: 'ENVIADO',
      rol_id: (await UsuarioRol.findOne({ where: { nombre_rol: 'productor_principal' } }))?.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    console.log(`Usuario creado: ${usuarioPendiente.email} con clave productorpendiente`);

    // Asociar el usuario PENDIENTE con la productora PENDIENTE
    await UsuarioMaestro.create({
      usuario_id: usuarioPendiente.id_usuario,
      productora_id: productoraPendiente.id_productora,
    });

    console.log(`Usuario asociado a productora: principal@productor.com -> ${productoraActiva.nombre_productora}`);
    console.log(`Usuario asociado a productora: secundario@productor.com -> ${productoraActiva.nombre_productora}`);
    console.log(`Usuario asociado a productora: pendiente@productor.com -> ${productoraPendiente.nombre_productora}`);

    console.log('[SEED] usuarios.seed completado con éxito.');
  } catch (error) {
    console.error('Error al ejecutar usuarios.seed:', error);
    throw error;
  }
};

export default seedUsuarios;