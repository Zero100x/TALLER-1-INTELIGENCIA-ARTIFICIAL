export interface Individual<T> {
  chromosome: T;
  fitness: number;      // Normalizado o transformado para selección (usualmente mayor = mejor)
  rawScore: number;     // Valor real del problema (ej. nro de conflictos, distancia en km, penalización, valor total)
  details?: any;        // Información diagnóstica adicional (desglose de restricciones, etc.)
}

export interface GAParameters {
  popSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  selectionMethod: 'tournament' | 'roulette';
  tournamentSize?: number;
  // Parámetros específicos por problema
  useRepair?: boolean;              // Para Asignación de Cursos y Mochila
  crossoverOperator?: 'OX' | 'PMX' | 'single_point' | 'uniform';
  mutationOperator?: 'swap' | 'inversion' | 'insertion' | 'bitflip';
}

export interface GenerationLog {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  bestRawScore: number;
  bestChromosome: any;
  bestDetails?: any;
}

export interface GAResult<T> {
  bestIndividual: Individual<T>;
  generationsRun: number;
  history: GenerationLog[];
  executionTimeMs: number;
  solved: boolean;
}

export interface MultiRunStats {
  problemName: string;
  configSummary: string;
  runs: number;
  bestRawScore: number;
  worstRawScore: number;
  avgRawScore: number;
  stdDevRawScore: number;
  avgGenerations: number;
  successRatePercentage: number;
  runDetails: Array<{
    run: number;
    bestRawScore: number;
    generations: number;
    timeMs: number;
  }>;
}
