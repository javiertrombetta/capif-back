import bcrypt from 'bcrypt';
import { Usuario, Productora, UsuarioMaestro, UsuarioVista, UsuarioVistaMaestro, UsuarioRol } from '../models';
import { generarCodigosISRC } from '../services/productoraService';

const seedUsuarios = async () => {
  try {
    console.log('Seeding usuarios...');

    // Encriptar claves
    const hashClave = async (clave: string): Promise<string> => {
      const saltRounds = 10;
      return await bcrypt.hash(clave, saltRounds);
    };

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
    const isrcCodes = await generarCodigosISRC(productoraPrincipal.id_productora);
    console.log(`Códigos ISRC generados para la productora:`, isrcCodes);

    // Crear productor_principal
    const productorPrincipalRol = await UsuarioRol.findOne({ where: { nombre_rol: 'productor_principal' } });
    if (!productorPrincipalRol) throw new Error("Rol 'productor_principal' no encontrado");

    const claveProductorPrincipal = await hashClave('productorprincipal');
    const productorPrincipal = await Usuario.create({
      email: 'principal@productor.com',
      clave: claveProductorPrincipal,
      nombre: 'Productor',
      apellido: 'Principal',
      telefono: '1123456789',
      tipo_registro: 'HABILITADO',
      rol_id: productorPrincipalRol.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    await UsuarioMaestro.create({
      usuario_id: productorPrincipal.id_usuario,
      productora_id: productoraPrincipal.id_productora,
    });

    const vistasProductorPrincipal = await UsuarioVista.findAll({
      where: { rol_id: productorPrincipal.rol_id },
    });

    await UsuarioVistaMaestro.bulkCreate(
      vistasProductorPrincipal.map((vista) => ({
        usuario_id: productorPrincipal.id_usuario,
        vista_id: vista.id_vista,
        is_habilitado: true,
      }))
    );

    // Crear productor_secundario asociado
    const productorSecundarioRol = await UsuarioRol.findOne({ where: { nombre_rol: 'productor_secundario' } });
    if (!productorSecundarioRol) throw new Error("Rol 'productor_secundario' no encontrado");

    const claveProductorSecundario = await hashClave('productorsecundario');
    const productorSecundario = await Usuario.create({
      email: 'secundario@productor.com',
      clave: claveProductorSecundario,
      nombre: 'Productor',
      apellido: 'Secundario',
      telefono: '1123456789',
      tipo_registro: 'HABILITADO',
      rol_id: productorSecundarioRol.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    await UsuarioMaestro.create({
      usuario_id: productorSecundario.id_usuario,
      productora_id: productoraPrincipal.id_productora,
    });

    const vistasProductorSecundario = await UsuarioVista.findAll({
      where: { rol_id: productorSecundario.rol_id },
    });

    await UsuarioVistaMaestro.bulkCreate(
      vistasProductorSecundario.map((vista) => ({
        usuario_id: productorSecundario.id_usuario,
        vista_id: vista.id_vista,
        is_habilitado: true,
      }))
    );

    // Crear admin_principal
    const adminPrincipalRol = await UsuarioRol.findOne({ where: { nombre_rol: 'admin_principal' } });
    if (!adminPrincipalRol) throw new Error("Rol 'admin_principal' no encontrado");

    const claveAdminPrincipal = await hashClave('adminprincipal');
    const adminPrincipal = await Usuario.create({
      email: 'principal@admin.com',
      clave: claveAdminPrincipal,
      nombre: 'Admin',
      apellido: 'Principal',
      telefono: '1123456789',
      tipo_registro: 'HABILITADO',
      rol_id: adminPrincipalRol.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    const vistasAdminPrincipal = await UsuarioVista.findAll({
      where: { rol_id: adminPrincipal.rol_id },
    });

    await UsuarioVistaMaestro.bulkCreate(
      vistasAdminPrincipal.map((vista) => ({
        usuario_id: adminPrincipal.id_usuario,
        vista_id: vista.id_vista,
        is_habilitado: true,
      }))
    );

    // Crear admin_secundario
    const adminSecundarioRol = await UsuarioRol.findOne({ where: { nombre_rol: 'admin_secundario' } });
    if (!adminSecundarioRol) throw new Error("Rol 'admin_secundario' no encontrado");

    const claveAdminSecundario = await hashClave('adminsecundario');
    const adminSecundario = await Usuario.create({
      email: 'secundario@admin.com',
      clave: claveAdminSecundario,
      nombre: 'Admin',
      apellido: 'Secundario',
      telefono: '1123456789',
      tipo_registro: 'HABILITADO',
      rol_id: adminSecundarioRol.id_rol,
      fecha_ultimo_cambio_rol: new Date(),
    });

    const vistasAdminSecundario = await UsuarioVista.findAll({
      where: { rol_id: adminSecundario.rol_id },
    });

    await UsuarioVistaMaestro.bulkCreate(
      vistasAdminSecundario.map((vista) => ({
        usuario_id: adminSecundario.id_usuario,
        vista_id: vista.id_vista,
        is_habilitado: true,
      }))
    );

    console.log('Usuarios creados correctamente.');
  } catch (error) {
    console.error('Error creando usuarios:', error);
  }
};

export default seedUsuarios;