'use strict';

import { QueryInterface, Sequelize } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      // Función para actualizar automáticamente el estado de un conflicto cuando se resuelve
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION update_status_on_conflict_resolution()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Si la fecha de resolución está presente, actualiza el estado del conflicto a 'Resuelto'
          IF (NEW.fecha_resolucion IS NOT NULL) THEN
            UPDATE Conflicto
            SET estado_id = (SELECT id_estado FROM Estado WHERE descripcion = 'Resuelto')
            WHERE id_conflicto = NEW.id_conflicto;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;        
       
        CREATE TRIGGER update_conflicto_status
        AFTER UPDATE ON Conflicto
        FOR EACH ROW EXECUTE FUNCTION update_status_on_conflict_resolution();
      `);

      console.log(
        'Trigger para actualización automática de estado en Conflicto creado correctamente.'
      );
    } catch (error) {
      console.error(
        'Error en la creación del trigger de actualización automática de estado:',
        error
      );
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface, _Sequelize: Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS update_conflicto_status ON Conflicto;
        DROP FUNCTION IF EXISTS update_status_on_conflict_resolution;
      `);

      console.log(
        'Trigger y función para actualización automática de estado eliminados correctamente.'
      );
    } catch (error) {
      console.error('Error al eliminar el trigger de actualización automática de estado:', error);
      throw error;
    }
  },
};
