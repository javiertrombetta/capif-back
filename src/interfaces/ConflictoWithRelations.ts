import {
  Conflicto,
  Fonograma,
  Estado,
  ComentarioConflicto,
  Involucrados,
  DecisionInvolucrados,
  TipoConflicto,
} from '../models';

export interface InvolucradosWithDecision extends Involucrados {
  DecisionInvolucrados: DecisionInvolucrados[];
}

export interface ConflictoWithRelations extends Conflicto {
  Fonograma: Fonograma;
  Estado: Estado;
  TipoConflicto: TipoConflicto;
  ComentarioConflicto: ComentarioConflicto[];
  Involucrados: InvolucradosWithDecision[]; 
}