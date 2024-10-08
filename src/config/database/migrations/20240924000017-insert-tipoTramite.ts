'use strict';

import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('TipoTramite', [
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Registro de usuario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Actualización de datos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Subida de archivos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Pago realizado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Generación de reporte',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Resolución de conflicto',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Eliminación de usuario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Acceso al sistema',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de permisos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Creación de cuenta bancaria',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Actualización de información de fonogramas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Asignación de titular de fonograma',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Gestión de ISRC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Comentario sobre conflicto',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Consulta realizada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de trámite',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Subida de documento',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Alta masiva',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Registro de actividad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Auditoría de cambios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Error de inserción',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de regla',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de estado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Postulación a premio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de tipo de persona',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Modificación de tipo de compañía',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Descarga de catálogos de repertorios',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Monitoreo de conflictos de titularidad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Depuración de repertorio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Subida de archivo masivo',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_tipo_tramite: uuidv4(),
        descripcion: 'Resolución de declaración de derechos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('TipoTramite', {}, {});
  },
};