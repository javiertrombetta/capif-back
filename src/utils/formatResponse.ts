export const formatUserResponse = (usuario: any) => ({
  id: usuario.user.id_usuario,
  email: usuario.user.email,
  nombre: usuario.user.nombre,
  apellido: usuario.user.apellido,
  telefono: usuario.user.telefono,
  rol: usuario.user.rol?.nombre_rol || null,
  estado: usuario.user.tipo_registro,
  isBloqueado: usuario.user.is_bloqueado,
  productoras: usuario.maestros.map((maestro: any) => ({
    id: maestro.productora?.id_productora,
    nombre: maestro.productora?.nombre_productora,
  })),
  vistas: usuario.vistas
    .filter((vistaMaestro: any) => vistaMaestro.vista)
    .map((vistaMaestro: any) => ({
      id_vista: vistaMaestro.id_vista_maestro,
      habilitado: vistaMaestro.is_habilitado,
      nombre: vistaMaestro.vista?.nombre_vista,
      superior: vistaMaestro.vista?.nombre_vista_superior,
    })),
});