import cls from "cls-hooked";
import { Sequelize } from "sequelize";

// Crear un namespace para manejar el contexto de transacciones
const namespace = cls.createNamespace("transacciones");

// Configurar Sequelize para usar el namespace
Sequelize.useCLS(namespace);

// Exportar el contexto
export default namespace;