import {
  Conflicto,
  Fonograma,
  Estado,
  ComentarioConflicto,
  Involucrados,
  DecisionInvolucrados,
} from '../models';

export interface ConflictoWithRelations extends Conflicto {
  Fonograma: Fonograma; // Aquí asumimos que siempre tendrás un fonograma, si no es así, puedes hacerlo opcional
  Estado: Estado;
  ComentarioConflicto: ComentarioConflicto[]; // Array de comentarios
  Involucrados: Array<{
    id_titular: number;
    DecisionInvolucrados: DecisionInvolucrados[];
  }>;
}
