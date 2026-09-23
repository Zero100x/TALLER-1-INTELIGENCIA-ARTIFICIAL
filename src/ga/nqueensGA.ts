import { Individual, GAParameters, GAResult, GenerationLog } from './types';

/**
 * N-Reinas: Representación por vector de permutación [r_0, r_1, ..., r_{N-1}]
 * donde el índice es la columna y el valor es la fila.
 */

export interface QueenConflictDetails {
  totalConflicts: number;
  conflictingPairs: Array<[number, number]>;
}

export function countQueenConflicts(chromosome: number[]): QueenConflictDetails {
  const N = chromosome.length;
  let conflicts = 0;
  const conflictingPairs: Array<[number, number]> = [];

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      // Conflicto en misma fila (imposible si es permutación pura, pero soportado)
      const sameRow = chromosome[i] === chromosome[j];
      // Conflicto en diagonal: |c1 - c2| == |r1 - r2|
      const sameDiagonal = Math.abs(i - j) === Math.abs(chromosome[i] - chromosome[j]);

      if (sameRow || sameDiagonal) {
        conflicts++;
        conflictingPairs.push([i, j]);
      }
    }
  }

  return { totalConflicts: conflicts, conflictingPairs };
}

export function evaluateNQueens(chromosome: number[]): Individual<number[]> {
  const details = countQueenConflicts(chromosome);
  // rawScore = número de conflictos (0 es la solución óptima)
  const rawScore = details.totalConflicts;
  // fitness: mientras menos conflictos, mayor aptitud
  const fitness = 1 / (1 + rawScore);

  return {
    chromosome: [...chromosome],
    fitness,
    rawScore,
    details
  };
}

function createRandomPermutation(N: number): number[] {
  const arr = Array.from({ length: N }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Cruzamiento PMX (Partially Mapped Crossover) para permutaciones
function pmxCrossover(parent1: number[], parent2: number[]): [number[], number[]] {
  const N = parent1.length;
  let point1 = Math.floor(Math.random() * N);
  let point2 = Math.floor(Math.random() * N);
  if (point1 > point2) [point1, point2] = [point2, point1];

  const child1 = Array(N).fill(-1);
  const child2 = Array(N).fill(-1);

  // Copiar el segmento medio
  for (let i = point1; i <= point2; i++) {
    child1[i] = parent1[i];
    child2[i] = parent2[i];
  }

  // Mapear elementos para child1
  for (let i = point1; i <= point2; i++) {
    const val2 = parent2[i];
    if (!child1.includes(val2)) {
      let pos = i;
      let valToPlace = val2;
      while (point1 <= pos && pos <= point2) {
        const val1InPos = parent1[pos];
        pos = parent2.indexOf(val1InPos);
      }
      child1[pos] = valToPlace;
    }
  }
  // Rellenar lo restante de parent2 en child1
  for (let i = 0; i < N; i++) {
    if (child1[i] === -1) child1[i] = parent2[i];
  }

  // Mapear elementos para child2
  for (let i = point1; i <= point2; i++) {
    const val1 = parent1[i];
    if (!child2.includes(val1)) {
      let pos = i;
      let valToPlace = val1;
      while (point1 <= pos && pos <= point2) {
        const val2InPos = parent2[pos];
        pos = parent1.indexOf(val2InPos);
      }
      child2[pos] = valToPlace;
    }
  }
  for (let i = 0; i < N; i++) {
    if (child2[i] === -1) child2[i] = parent1[i];
  }

  return [child1, child2];
}

// Mutación por Intercambio (Swap)
function swapMutation(chromosome: number[], mutationRate: number): number[] {
  const result = [...chromosome];
  if (Math.random() < mutationRate) {
    const N = result.length;
    const idx1 = Math.floor(Math.random() * N);
    let idx2 = Math.floor(Math.random() * N);
    while (idx1 === idx2 && N > 1) {
      idx2 = Math.floor(Math.random() * N);
    }
    [result[idx1], result[idx2]] = [result[idx2], result[idx1]];
  }
  return result;
}

// Selección por Torneo
function tournamentSelect(pop: Individual<number[]>[], tournamentSize: number = 3): Individual<number[]> {
  let best = pop[Math.floor(Math.random() * pop.length)];
  for (let i = 1; i < tournamentSize; i++) {
    const competitor = pop[Math.floor(Math.random() * pop.length)];
    if (competitor.fitness > best.fitness) {
      best = competitor;
    }
  }
  return best;
}

export function runNQueensGA(N: number, params: GAParameters): GAResult<number[]> {
  const startTime = performance.now();
  const { popSize, maxGenerations, mutationRate, crossoverRate, elitismCount } = params;

  // 1. Población inicial
  let population: Individual<number[]>[] = Array.from({ length: popSize }, () =>
    evaluateNQueens(createRandomPermutation(N))
  );

  const history: GenerationLog[] = [];
  let solved = false;

  for (let gen = 0; gen < maxGenerations; gen++) {
    // Ordenar por fitness descendente
    population.sort((a, b) => b.fitness - a.fitness);

    const bestCurrent = population[0];
    const worstCurrent = population[population.length - 1];
    const avgFitness = population.reduce((sum, ind) => sum + ind.fitness, 0) / popSize;

    history.push({
      generation: gen,
      bestFitness: bestCurrent.fitness,
      avgFitness,
      worstFitness: worstCurrent.fitness,
      bestRawScore: bestCurrent.rawScore,
      bestChromosome: [...bestCurrent.chromosome],
      bestDetails: bestCurrent.details
    });

    if (bestCurrent.rawScore === 0) {
      solved = true;
      break;
    }

    // Elitismo
    const newPop: Individual<number[]>[] = [];
    for (let e = 0; e < Math.min(elitismCount, popSize); e++) {
      newPop.push(population[e]);
    }

    // Generar nueva descendencia
    while (newPop.length < popSize) {
      const parent1 = tournamentSelect(population);
      const parent2 = tournamentSelect(population);

      let child1Chrom = [...parent1.chromosome];
      let child2Chrom = [...parent2.chromosome];

      if (Math.random() < crossoverRate) {
        [child1Chrom, child2Chrom] = pmxCrossover(parent1.chromosome, parent2.chromosome);
      }

      child1Chrom = swapMutation(child1Chrom, mutationRate);
      child2Chrom = swapMutation(child2Chrom, mutationRate);

      newPop.push(evaluateNQueens(child1Chrom));
      if (newPop.length < popSize) {
        newPop.push(evaluateNQueens(child2Chrom));
      }
    }

    population = newPop;
  }

  population.sort((a, b) => b.fitness - a.fitness);
  const endTime = performance.now();

  return {
    bestIndividual: population[0],
    generationsRun: history.length,
    history,
    executionTimeMs: Math.round(endTime - startTime),
    solved: population[0].rawScore === 0
  };
}
