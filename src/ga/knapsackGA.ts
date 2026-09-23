import { Individual, GAParameters, GAResult, GenerationLog } from './types';

export interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  category: string;
}

// 15 Objetos con pesos y valores variados
export const DEFAULT_KNAPSACK_ITEMS: KnapsackItem[] = [
  { id: 0, name: 'Computador Portátil', weight: 8, value: 150, category: 'Tecnología' },
  { id: 1, name: 'Cámara Fotográfica', weight: 3, value: 80, category: 'Tecnología' },
  { id: 2, name: 'Kit de Primeros Auxilios', weight: 4, value: 90, category: 'Salud' },
  { id: 3, name: 'Batería Solar Externa', weight: 2, value: 60, category: 'Tecnología' },
  { id: 4, name: 'Carpa de Acampar', weight: 12, value: 110, category: 'Supervivencia' },
  { id: 5, name: 'Bolsa de Dormir', weight: 7, value: 70, category: 'Supervivencia' },
  { id: 6, name: 'Sistema de Filtrado de Agua', weight: 2, value: 85, category: 'Salud' },
  { id: 7, name: 'Herramienta Multiuso', weight: 1, value: 40, category: 'Supervivencia' },
  { id: 8, name: 'Ración de Comida (1 semana)', weight: 10, value: 120, category: 'Alimento' },
  { id: 9, name: 'Ropa Térmica Especial', weight: 5, value: 65, category: 'Ropa' },
  { id: 10, name: 'Radio Satelital', weight: 3, value: 95, category: 'Tecnología' },
  { id: 11, name: 'Linterna LED de Alta Potencia', weight: 1, value: 35, category: 'Supervivencia' },
  { id: 12, name: 'Botas de Montaña', weight: 6, value: 75, category: 'Ropa' },
  { id: 13, name: 'Estufa de Gas Portátil', weight: 4, value: 50, category: 'Supervivencia' },
  { id: 14, name: 'GPS de Mano', weight: 2, value: 100, category: 'Tecnología' },
];

export interface KnapsackDetails {
  totalWeight: number;
  totalValue: number;
  maxCapacity: number;
  isOverweight: boolean;
  itemCount: number;
  strategy: 'penalty' | 'repair';
}

export function evaluateKnapsack(
  chromosome: number[],
  maxCapacity: number,
  items: KnapsackItem[] = DEFAULT_KNAPSACK_ITEMS,
  strategy: 'penalty' | 'repair' = 'penalty'
): Individual<number[]> {
  let totalWeight = 0;
  let totalValue = 0;
  let itemCount = 0;

  chromosome.forEach((gene, idx) => {
    if (gene === 1) {
      totalWeight += items[idx].weight;
      totalValue += items[idx].value;
      itemCount++;
    }
  });

  const isOverweight = totalWeight > maxCapacity;
  let fitness = totalValue;

  if (isOverweight && strategy === 'penalty') {
    // Penalización proporcional al exceso de peso
    const excess = totalWeight - maxCapacity;
    fitness = Math.max(0.001, totalValue - excess * 25);
  }

  return {
    chromosome: [...chromosome],
    fitness,
    rawScore: totalValue,
    details: {
      totalWeight,
      totalValue,
      maxCapacity,
      isOverweight,
      itemCount,
      strategy
    }
  };
}

// Operador de Reparación Voraz (Greedy Repair): elimina elementos con menor relación valor/peso
export function repairKnapsack(
  chromosome: number[],
  maxCapacity: number,
  items: KnapsackItem[] = DEFAULT_KNAPSACK_ITEMS
): number[] {
  const result = [...chromosome];
  let currentWeight = result.reduce((sum, gene, idx) => sum + (gene === 1 ? items[idx].weight : 0), 0);

  if (currentWeight <= maxCapacity) return result;

  // Ordenar índices incluidos por su eficiencia (valor / peso) de menor a mayor
  const includedIndices: number[] = [];
  result.forEach((gene, idx) => {
    if (gene === 1) includedIndices.push(idx);
  });

  includedIndices.sort((a, b) => {
    const ratioA = items[a].value / items[a].weight;
    const ratioB = items[b].value / items[b].weight;
    return ratioA - ratioB; // Menor eficiencia primero
  });

  // Desactivar elementos menos eficientes hasta cumplir la capacidad
  for (const idx of includedIndices) {
    if (currentWeight <= maxCapacity) break;
    result[idx] = 0;
    currentWeight -= items[idx].weight;
  }

  return result;
}

// Cruzamiento de un solo punto para cromosomas binarios
function singlePointCrossover(parent1: number[], parent2: number[]): [number[], number[]] {
  const N = parent1.length;
  const point = Math.floor(Math.random() * (N - 1)) + 1;
  const child1 = [...parent1.slice(0, point), ...parent2.slice(point)];
  const child2 = [...parent2.slice(0, point), ...parent1.slice(point)];
  return [child1, child2];
}

// Mutación por inversión de bit (Bit-flip)
function bitFlipMutation(chromosome: number[], mutationRate: number): number[] {
  return chromosome.map(bit => (Math.random() < mutationRate ? (bit === 1 ? 0 : 1) : bit));
}

function tournamentSelect(pop: Individual<number[]>[], size: number = 3): Individual<number[]> {
  let best = pop[Math.floor(Math.random() * pop.length)];
  for (let i = 1; i < size; i++) {
    const candidate = pop[Math.floor(Math.random() * pop.length)];
    if (candidate.fitness > best.fitness) best = candidate;
  }
  return best;
}

export function runKnapsackGA(
  maxCapacity: number,
  params: GAParameters,
  items: KnapsackItem[] = DEFAULT_KNAPSACK_ITEMS
): GAResult<number[]> {
  const startTime = performance.now();
  const N = items.length;
  const { popSize, maxGenerations, mutationRate, crossoverRate, elitismCount, useRepair } = params;
  const strategy = useRepair ? 'repair' : 'penalty';

  function randomBinary(): number[] {
    return Array.from({ length: N }, () => (Math.random() < 0.4 ? 1 : 0));
  }

  let population = Array.from({ length: popSize }, () => {
    let chrom = randomBinary();
    if (useRepair) chrom = repairKnapsack(chrom, maxCapacity, items);
    return evaluateKnapsack(chrom, maxCapacity, items, strategy);
  });

  const history: GenerationLog[] = [];

  for (let gen = 0; gen < maxGenerations; gen++) {
    population.sort((a, b) => b.fitness - a.fitness);

    const bestCurrent = population[0];
    const worstCurrent = population[population.length - 1];
    const avgFitness = population.reduce((acc, ind) => acc + ind.fitness, 0) / popSize;

    history.push({
      generation: gen,
      bestFitness: bestCurrent.fitness,
      avgFitness,
      worstFitness: worstCurrent.fitness,
      bestRawScore: bestCurrent.rawScore,
      bestChromosome: [...bestCurrent.chromosome],
      bestDetails: bestCurrent.details
    });

    const newPop: Individual<number[]>[] = [];

    // Elitismo
    const actualElitism = Math.min(elitismCount, popSize);
    for (let e = 0; e < actualElitism; e++) {
      newPop.push(population[e]);
    }

    while (newPop.length < popSize) {
      const p1 = tournamentSelect(population);
      const p2 = tournamentSelect(population);

      let [c1, c2] = [p1.chromosome, p2.chromosome];
      if (Math.random() < crossoverRate) {
        [c1, c2] = singlePointCrossover(p1.chromosome, p2.chromosome);
      }

      c1 = bitFlipMutation(c1, mutationRate);
      c2 = bitFlipMutation(c2, mutationRate);

      if (useRepair) {
        c1 = repairKnapsack(c1, maxCapacity, items);
        c2 = repairKnapsack(c2, maxCapacity, items);
      }

      newPop.push(evaluateKnapsack(c1, maxCapacity, items, strategy));
      if (newPop.length < popSize) {
        newPop.push(evaluateKnapsack(c2, maxCapacity, items, strategy));
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
    solved: !population[0].details?.isOverweight
  };
}
