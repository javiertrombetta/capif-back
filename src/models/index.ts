import sequelize from '../config/database/sequelize';

import AuditoriaCambio from './AuditoriaCambio';
import AuditoriaRepertorio from './AuditoriaRepertorio';
import AuditoriaSesion from './AuditoriaSesion';
import Cashflow from './Cashflow';
import CashflowLiquidacion from './CashflowLiquidacion';
import CashflowMaestro from './CashflowMaestro';
import CashflowPago from './CashflowPago';
import CashflowPendiente from './CashflowPendiente';
import CashflowRechazo from './CashflowRechazo';
import CashflowTraspaso from './CashflowTraspaso';
import Conflicto from './Conflicto';
import ConflictoParte from './ConflictoParte';
import Fonograma from './Fonograma';
import FonogramaArchivo from './FonogramaArchivo';
import FonogramaEnvio from './FonogramaEnvio';
import FonogramaMaestro from './FonogramaMaestro';
import FonogramaParticipacion from './FonogramaParticipacion';
import FonogramaTerritorio from './FonogramaTerritorio';
import FonogramaTerritorioMaestro from './FonogramaTerritorioMaestro';
import Productora from './Productora';
import ProductoraDocumento from './ProductoraDocumento';
import ProductoraDocumentoTipo from './ProductoraDocumentoTipo';
import ProductoraISRC from './ProductoraISRC';
import ProductoraMensaje from './ProductoraMensaje';
import ProductoraPremio from './ProductoraPremio';
import Usuario from './Usuario';
import UsuarioMaestro from './UsuarioMaestro';
import UsuarioRol from './UsuarioRol';
import UsuarioVista from './UsuarioVista';
import UsuarioVistaMaestro from './UsuarioVistaMaestro';


//AuditoriaCambio

AuditoriaCambio.belongsTo(Usuario, {
  foreignKey: 'usuario_originario_id',
  as: 'registranteDeAuditoria',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaCambio, {
  foreignKey: 'usuario_originario_id',
  as: 'auditoriasDelRegistrante',
  onDelete: 'RESTRICT',
});

AuditoriaCambio.belongsTo(Usuario, {
  foreignKey: 'usuario_destino_id',
  as: 'usuarioAuditado',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaCambio, {
  foreignKey: 'usuario_destino_id',
  as: 'auditoriasDelAuditado',
  onDelete: 'RESTRICT',
});



//AuditoriaRepertorio

AuditoriaRepertorio.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaAuditado',
  onDelete: 'SET NULL',
});

Fonograma.hasMany(AuditoriaRepertorio, {
  foreignKey: 'fonograma_id',
  as: 'auditoriasDelFonograma',
  onDelete: 'RESTRICT',
});

AuditoriaRepertorio.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'registranteDeRepertorio',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaRepertorio, {
  foreignKey: 'usuario_registrante_id',
  as: 'repertoriosDelAuditado',
  onDelete: 'RESTRICT',
});



// AuditoriaSesion

AuditoriaSesion.belongsTo(Usuario, {
  foreignKey: 'usuario_registrante_id',
  as: 'registranteDeSesion',
  onDelete: 'SET NULL',
});

Usuario.hasMany(AuditoriaSesion, {
  foreignKey: 'usuario_registrante_id',
  as: 'sesionesDelAuditado',
  onDelete: 'RESTRICT',
});



// Cashflow

Cashflow.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDeCC',
  onDelete: 'CASCADE',
});

Productora.hasOne(Cashflow, {
  foreignKey: 'productora_id',
  as: 'ccDeLaProductora',
  onDelete: 'RESTRICT',
});



// CashflowMaestro

CashflowMaestro.belongsTo(Cashflow, {
  foreignKey: 'cashflow_id',
  as: 'cashflow',
  onDelete: 'CASCADE',
});

Cashflow.hasMany(CashflowMaestro, {
  foreignKey: 'cashflow_id',
  as: 'transacciones',
  onDelete: 'RESTRICT',
});

CashflowMaestro.belongsTo(CashflowLiquidacion, {
  foreignKey: 'liquidacion_id',
  as: 'liquidacion',
  onDelete: 'SET NULL',
});

CashflowMaestro.belongsTo(CashflowPago, {
  foreignKey: 'pago_id',
  as: 'pago',
  onDelete: 'SET NULL',
});

CashflowMaestro.belongsTo(CashflowRechazo, {
  foreignKey: 'rechazo_id',
  as: 'rechazo',
  onDelete: 'SET NULL',
});

CashflowMaestro.belongsTo(CashflowTraspaso, {
  foreignKey: 'traspaso_id',
  as: 'traspaso',
  onDelete: 'SET NULL',
});



// CashflowLiquidaciones

CashflowLiquidacion.belongsTo(CashflowMaestro, {
  foreignKey: 'cashflow_maestro_id',
  as: 'maestroDeLaLiquidacion',
  onDelete: 'RESTRICT',
});



// CashflowPago

CashflowPago.belongsTo(CashflowMaestro, {
  foreignKey: 'cashflow_maestro_id',
  as: 'maestroDelPago',
  onDelete: 'RESTRICT',
});



// CashflowRechazo

CashflowRechazo.belongsTo(CashflowMaestro, {
  foreignKey: 'cashflow_maestro_id',
  as: 'maestroDelRechazo',
  onDelete: 'RESTRICT',
});



// CashflowTraspaso

CashflowTraspaso.belongsTo(CashflowMaestro, {
  foreignKey: 'cashflow_maestro_id',
  as: 'maestroDelTraspaso',
  onDelete: 'RESTRICT',
});



// Conflicto

Conflicto.belongsTo(Fonograma, {
  foreignKey: "fonograma_id",
  as: "fonogramaDelConflicto",
  onDelete: "RESTRICT",
});

Fonograma.hasMany(Conflicto, {
  foreignKey: "fonograma_id",
  as: "conflictosDelFonograma",
  onDelete: "RESTRICT",
});

Productora.hasMany(Conflicto, {
  foreignKey: "productora_id",
  as: "conflictosDeProductora",
  onDelete: "RESTRICT",
});

Conflicto.belongsTo(Productora, {
  foreignKey: "productora_id",
  as: "productoraDelConflicto",
  onDelete: "RESTRICT",
});




// ConflictoParte

ConflictoParte.belongsTo(Conflicto, {
  foreignKey: 'conflicto_id',
  as: 'conflictoDeLaParte',
  onDelete: 'CASCADE',
});

Conflicto.hasMany(ConflictoParte, {
  foreignKey: 'conflicto_id',
  as: 'partesDelConflicto',
  onDelete: 'CASCADE',
});

ConflictoParte.belongsTo(FonogramaParticipacion, {
  foreignKey: 'participacion_id',
  as: 'participacionDeLaParte',
  onDelete: 'CASCADE',
});

FonogramaParticipacion.hasMany(ConflictoParte, {
  foreignKey: 'participacion_id',
  as: 'partesDelParticipante',
  onDelete: 'CASCADE',
});




// Fonograma

Fonograma.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDelFonograma',
  onDelete: 'RESTRICT',
});

Productora.hasMany(Fonograma, {
  foreignKey: 'productora_id',
  as: 'fonogramasDeLaProductora',
  onDelete: 'RESTRICT',
});

// Fonograma.belongsTo(FonogramaArchivo, {
//   foreignKey: 'archivo_audio_id',
//   as: 'archivoAudioDelFonograma',
//   onDelete: 'SET NULL',
// });

// FonogramaArchivo.hasOne(Fonograma, {
//   foreignKey: 'archivo_audio_id',
//   as: 'fonogramaDelArchivo',
//   onDelete: 'SET NULL',
// });



// FonogramaArchivo

FonogramaArchivo.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaDelArchivoAudio',
  onDelete: 'RESTRICT',
});

Fonograma.hasOne(FonogramaArchivo, {
  foreignKey: 'fonograma_id',
  as: 'archivoDelFonograma',
  onDelete: 'RESTRICT',
});




// FonogramaEnvio

FonogramaEnvio.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaDelEnvio',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaEnvio, {
  foreignKey: 'fonograma_id',
  as: 'enviosDelFonograma',
  onDelete: 'RESTRICT',
});




// FonogramaMaestro

FonogramaMaestro.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaDelMaestroDeFonograma',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaMaestro, {
  foreignKey: 'fonograma_id',
  as: 'maestrosDelFonograma',
  onDelete: 'RESTRICT',
});


// FonogramaParticipacion

FonogramaParticipacion.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaDelParticipante',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaParticipacion, {
  foreignKey: 'fonograma_id',
  as: 'participantesDelFonograma',
  onDelete: 'RESTRICT',
});

FonogramaParticipacion.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDeParticipante',
  onDelete: 'RESTRICT',
});

Productora.hasMany(FonogramaParticipacion, {
  foreignKey: 'productora_id',
  as: 'participacionesDeLaProductora',
  onDelete: 'RESTRICT',
});




// FonogramaTerritorio (NA)



// FonogramaTerritorioMaestro

FonogramaTerritorioMaestro.belongsTo(Fonograma, {
  foreignKey: 'fonograma_id',
  as: 'fonogramaDelVinculo',
  onDelete: 'RESTRICT',
});

Fonograma.hasMany(FonogramaTerritorioMaestro, {
  foreignKey: 'fonograma_id',
  as: 'vinculosDelFonograma',
  onDelete: 'RESTRICT',
});

FonogramaTerritorioMaestro.belongsTo(FonogramaTerritorio, {
  foreignKey: 'territorio_id',
  as: 'territorioDelVinculo',
  onDelete: 'RESTRICT',
});

FonogramaTerritorio.hasMany(FonogramaTerritorioMaestro, {
  foreignKey: 'territorio_id',
  as: 'vinculosDelTerritorio',
  onDelete: 'RESTRICT',
});



// Productora
Productora.hasMany(ProductoraMensaje, {
    foreignKey: 'productora_id',
    as: 'mensajesDeLaProductora',
  });


// ProductoraDocumento

ProductoraDocumento.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDelDocumento',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraDocumento, {
  foreignKey: 'productora_id',
  as: 'documentosDeLaProductora',
  onDelete: 'CASCADE',
});

ProductoraDocumento.belongsTo(ProductoraDocumentoTipo, {
  foreignKey: 'tipo_documento_id',
  as: 'tipoDeDocumento',
  onDelete: 'SET NULL',
});

ProductoraDocumentoTipo.hasMany(ProductoraDocumento, {
  foreignKey: 'tipo_documento_id',
  as: 'documentosDelTipo',
  onDelete: 'SET NULL',
});



// ProductoraDocumentoTipo (NA)



// ProductoraISRC

ProductoraISRC.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDelCodigo',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraISRC, {
  foreignKey: 'productora_id',
  as: 'codigosDeLaProductora',
  onDelete: 'CASCADE',
});



// ProductoraMensaje
ProductoraMensaje.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuarioDelMensaje',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

ProductoraMensaje.belongsTo(Productora, {
    foreignKey: 'productora_id',
    as: 'productoraDelMensaje',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });


// ProductoraPremio

ProductoraPremio.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productoraDelPremio',
  onDelete: 'CASCADE',
});

Productora.hasMany(ProductoraPremio, {
  foreignKey: 'productora_id',
  as: 'premiosDeLaProductora',
  onDelete: 'CASCADE',
});



// Usuario

Usuario.belongsTo(UsuarioRol, {
  foreignKey: 'rol_id',
  as: 'rol',
  onDelete: 'RESTRICT',
});

UsuarioRol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'roles',
  onDelete: 'SET NULL',
});

Usuario.hasMany(ProductoraMensaje, {
    foreignKey: 'usuario_id',
    as: 'mensajesDelUsuario',
  });



// UsuarioMaestro

UsuarioMaestro.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuarioRegistrante',
  onDelete: 'CASCADE',
});

Usuario.hasMany(UsuarioMaestro, {
  foreignKey: 'usuario_id',
  as: 'usuariosRegistrantes',
  onDelete: 'CASCADE',
});

UsuarioMaestro.belongsTo(Productora, {
  foreignKey: 'productora_id',
  as: 'productora',
  onDelete: 'RESTRICT',
});

Productora.hasMany(UsuarioMaestro, {
  foreignKey: 'productora_id',
  as: 'productoras',
  onDelete: 'SET NULL',
});



// UsuarioRol (NA)



// UsuarioVista

UsuarioVista.belongsTo(UsuarioRol, {
  foreignKey: 'rol_id',
  as: 'rolDeVista',
  onDelete: 'CASCADE',
});

UsuarioRol.hasMany(UsuarioVista, {
  foreignKey: 'rol_id',
  as: 'vistasDelRol',
  onDelete: 'CASCADE',
});



// UsuarioVistaMaestro

UsuarioVistaMaestro.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuarioDeVista',
  onDelete: 'CASCADE',
});

Usuario.hasMany(UsuarioVistaMaestro, {
  foreignKey: 'usuario_id',
  as: 'vistasMaestroDelUsuario',
  onDelete: 'CASCADE',
});

UsuarioVistaMaestro.belongsTo(UsuarioVista, {
  foreignKey: 'vista_id',
  as: 'vista',
  onDelete: 'CASCADE',
});

UsuarioVista.hasMany(UsuarioVistaMaestro, {
  foreignKey: 'vista_id',
  as: 'vistasMaestroDeVista',
  onDelete: 'CASCADE',
});


////////////////////////////////////////////////////////////////

// Validación de relaciones

// export const validateAssociations = () => {
//   const errors: string[] = [];
//   const aliasesTracker: { [key: string]: string[] } = {};

//   Object.keys(sequelize.models).forEach((modelName) => {
//     const model = sequelize.models[modelName];
//     console.log(`Validando modelo: ${modelName}`);

//     // Verificar que el modelo tenga asociaciones definidas
//     if (!model.associations || Object.keys(model.associations).length === 0) {
//       console.warn(`⚠️  El modelo "${modelName}" no tiene asociaciones definidas.`);
//       return;
//     }

//     // Validar cada asociación del modelo
//     Object.entries(model.associations).forEach(([associationName, association]: any) => {
//       const targetName = association.target?.name;

//       // Validar que la asociación apunte a un modelo existente
//       if (!sequelize.models[targetName]) {
//         const error = `❌ La asociación "${associationName}" en el modelo "${modelName}" apunta a un modelo inexistente: "${targetName}".`;
//         console.error(error);
//         errors.push(error);
//         return;
//       }

//       // Validar clave foránea
//       if (!association.foreignKey) {
//         const warning = `⚠️  La asociación "${associationName}" en el modelo "${modelName}" no tiene una clave foránea definida.`;
//         console.warn(warning);
//         errors.push(warning);
//       }

//       // Validar alias único
//       const alias = association.as;
//       if (!alias) {
//         const warning = `⚠️  La asociación "${associationName}" en el modelo "${modelName}" no tiene un alias definido.`;
//         console.warn(warning);
//         errors.push(warning);
//       } else {
//         if (!aliasesTracker[alias]) {
//           aliasesTracker[alias] = [];
//         }
//         aliasesTracker[alias].push(`${modelName}.${associationName}`);

//         if (aliasesTracker[alias].length > 1) {
//           const error = `❌ Alias duplicado: el alias "${alias}" se reutiliza en las siguientes asociaciones:\n- ${aliasesTracker[alias].join('\n- ')}`;
//           console.error(error);
//           errors.push(error);
//         }
//       }
//     });
//   });

//   // Validar dependencias cíclicas
//   try {
//     validateCycles();
//   } catch (cycleError) {
//     if (cycleError instanceof Error) {
//       console.error(cycleError.message);
//       errors.push(cycleError.message);
//     } else {
//       console.error('❌ Error desconocido durante la validación de ciclos:', cycleError);
//       errors.push('Error desconocido durante la validación de ciclos');
//     }
//   }

//   // Reportar resultados
//   if (errors.length > 0) {
//     console.error('\nResumen de problemas encontrados en las asociaciones:');
//     errors.forEach((error) => console.error(error));
//     throw new Error('Errores encontrados en las asociaciones. Verifique los logs anteriores.');
//   } else {
//     console.log('✅ Todas las asociaciones están correctamente configuradas.');
//   }
// };

// /**
//  * Valida ciclos en las dependencias de los modelos.
//  * Lanza un error si se detecta un ciclo.
//  */
// const validateCycles = () => {
//   const visited: Set<string> = new Set();
//   const stack: Set<string> = new Set();
//   const path: string[] = []; // Mantendrá el camino recorrido.

//   const dfs = (modelName: string) => {
//     if (stack.has(modelName)) {
//       // Ciclo detectado, agrega detalles del camino que causa el ciclo.
//       const cyclePath = [...path, modelName].join(' -> ');
//       throw new Error(`❌ Ciclo detectado en las dependencias del modelo: "${modelName}". Camino: ${cyclePath}`);
//     }
//     if (visited.has(modelName)) {
//       return; // Ya visitado, no hay necesidad de procesarlo nuevamente.
//     }
//     visited.add(modelName);
//     stack.add(modelName);
//     path.push(modelName);

//     const model = sequelize.models[modelName];
//     Object.values(model.associations || {}).forEach((association: any) => {
//       const targetName = association.target?.name;
//       if (targetName) {
//         dfs(targetName);
//       }
//     });

//     stack.delete(modelName);
//     path.pop(); // Elimina el modelo actual del camino al retroceder.
//   };

//   Object.keys(sequelize.models).forEach((modelName) => dfs(modelName));
// };

// // Validar las asociaciones automáticamente al iniciar
// try {
//   validateAssociations();
// } catch (err) {
//   console.error('❌ Error durante la validación de asociaciones:', err);
//   process.exit(1); // Finaliza el proceso si hay errores críticos
// }

////////////////////////////////////////////////////////////////

// Sequelize-erd

// const models = {
//   AuditoriaCambio,
//   AuditoriaRepertorio,
//   AuditoriaSesion,
//   Cashflow,
//   CashflowLiquidacion,
//   CashflowPago,
//   CashflowRechazo,
//   CashflowTraspaso,
//   Conflicto,
//   ConflictoParte,
//   Fonograma,
//   FonogramaArchivo,
//   FonogramaEnvio,
//   FonogramaMaestro,
//   FonogramaParticipacion,
//   FonogramaTerritorio,
//   FonogramaTerritorioMaestro,
//   Productora,
//   ProductoraDocumento,
//   ProductoraDocumentoTipo,
//   ProductoraISRC,
//   ProductoraMensaje,
//   ProductoraPremio,
//   Usuario,
//   UsuarioMaestro,
//   UsuarioRol,
//   UsuarioVista,
//   UsuarioVistaMaestro,
// };

// // Inicializar los modelos
// Object.values(models).forEach((model) => {
//   if (model.init && typeof model.init === 'function') {
//     model.init({}, { sequelize });
//   }
// });

// // Asociar los modelos
// Object.values(models).forEach((model) => {
//   if ('associate' in model && typeof model.associate === 'function') {
//     model.associate(models);
//   }
// });

////////////////////////////////////////////////////////////////

export {
  sequelize,
  AuditoriaCambio,
  AuditoriaRepertorio,
  AuditoriaSesion,
  Cashflow,
  CashflowLiquidacion,
  CashflowMaestro,
  CashflowPago,
  CashflowPendiente,
  CashflowRechazo,
  CashflowTraspaso,
  Conflicto,
  ConflictoParte,
  Fonograma,
  FonogramaArchivo,
  FonogramaEnvio,
  FonogramaMaestro,
  FonogramaParticipacion,
  FonogramaTerritorio,
  FonogramaTerritorioMaestro,
  Productora,
  ProductoraDocumento,
  ProductoraDocumentoTipo,
  ProductoraISRC,
  ProductoraMensaje,
  ProductoraPremio,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
  UsuarioVista,
  UsuarioVistaMaestro,
};