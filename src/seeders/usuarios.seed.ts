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
    const productoraPrincipal = await Productora.create({
      nombre_productora: 'WARNER MUSIC ARGENTINA SA',
      tipo_persona: 'JURIDICA',
      cuit_cuil: '30601412620',
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
    });    

    // Generar códigos ISRC para la productora
    // const isrcCodes = await generarCodigosISRC(productoraPrincipal.id_productora);
    // console.log('Códigos ISRC generados para la productora:', isrcCodes);

    // Procesar usuarios
    for (const usuario of usuariosData) {
      const { nombreRol, email, clave, nombre, apellido, telefono } = usuario;

      // Buscar el rol asociado
      const rol = await UsuarioRol.findOne({ where: { nombre_rol: nombreRol } });
      if (!rol) throw new Error(`Rol '${nombreRol}' no encontrado`);

      // Encriptar clave
      const claveHash = await bcrypt.hash(clave, 10);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
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

      // Asociar con la productora principal
      await UsuarioMaestro.create({
        usuario_id: nuevoUsuario.id_usuario,
        productora_id: productoraPrincipal.id_productora,
      });

      // Buscar vistas asociadas al rol del usuario
      const vistas = await UsuarioVista.findAll({ where: { rol_id: rol.id_rol } });

      // Asociar vistas al usuario
      await UsuarioVistaMaestro.bulkCreate(
        vistas.map((vista) => ({
          usuario_id: nuevoUsuario.id_usuario,
          vista_id: vista.id_vista,
          is_habilitado: true,
        }))
      );      
    }

    console.log('usuarios.seed completado con éxito.');
  } catch (error) {
    console.error('Error al ejecutar usuarios.seed:', error);
    throw error;
  }
};

export default seedUsuarios;