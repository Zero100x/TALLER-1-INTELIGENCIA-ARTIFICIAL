import { Individual, GAParameters, GAResult, GenerationLog } from './types';

export interface City {
  id: number;
  name: string;
  x: number;
  y: number;
}

// Generador de conjuntos de ciudades predefinidas con coordenadas fijas (para reproducibilidad)
export function getPresetCities(numCities: 8 | 10 | 15): City[] {
  const fullList: City[] = [
    { id: 0, name: 'Bogotá', x: 200, y: 350 },
    { id: 1, name: 'Medellín', x: 150, y: 220 },
    { id: 2, name: 'Cali', x: 100, y: 400 },
    { id: 3, name: 'Barranquilla', x: 220, y: 80 },
    { id: 4, name: 'Cartagena', x: 180, y: 100 },
    { id: 5, name: 'Bucaramanga', x: 300, y: 240 },
    { id: 6, name: 'Pereira', x: 140, y: 330 },
    { id: 7, name: 'Santa Marta', x: 260, y: 70 },
    { id: 8, name: 'Cúcuta', x: 340, y: 180 },
    { id: 9, name: 'Ibagué', x: 190, y: 370 },
    { id: 10, name: 'Pastos', x: 80, y: 500 },
    { id: 11, name: 'Villavicencio', x: 260, y: 380 },
    { id: 12, name: 'Manizales', x: 160, y: 310 },
    { id: 13, name: 'Neiva', x: 170, y: 440 },
    { id: 14, name: 'Armenia', x: 150, y: 345 },
  ];
  return fullList.slice(0, numCities);
}

export function createDistanceMatrix(cities: City[]): number[][] {
  const N = cities.length;
  const matrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i !== j) {
        const dx = cities[i].x - cities[j].x;
        const dy = cities[i].y - cities[j].y;
        matrix[i][j] = Math.hypot(dx, dy);
      }
    }
  }
  return matrix;
}

export function calculateRouteDistance(route: number[], distMatrix: number[][]): number {
  let dist = 0;
  const N = route.length;
  for (let i = 0; i < N - 1; i++) {
    dist += distMatrix[route[i]][route[i + 1]];
  }
  // Regreso al origen
  dist += distMatrix[route[N - 1]][route[0]];
  return dist;
}

export function evaluateTSP(route: number[], distMatrix: number[][]): Individual<number[]> {
  const totalDist = calculateRouteDistance(route, distMatrix);
  // Fitness para minimización: mayor fitness -> menor distancia
  const fitness = 10000 / (totalDist + 0.0001);
  return {
    chromosome: [...route],
    fitness,
    rawScore: Math.round(totalDist * 100) / 100
  };
}

// Cruzamiento OX (Order Crossover)
export function orderCrossover(parent1: number[], parent2: number[]): [number[], number[]] {
  const N = parent1.length;
  let p1 = Math.floor(Math.random() * N);
  let p2 = Math.floor(Math.random() * N);
  if (p1 > p2) [p1, p2] = [p2, p1];

  function buildChild(pA: number[], pB: number[]): number[] {
    const child = Array(N).fill(-1);
    // Copiar subsegmento de pA
    for (let i = p1; i <= p2; i++) {
      child[i] = pA[i];
    }
    // Rellenar con el orden relativo de pB comenzando tras p2
    let currentChildIdx = (p2 + 1) % N;
    for (let i = 0; i < N; i++) {
      const pBIdx = (p2 + 1 + i) % N;
      const val = pB[pBIdx];
      if (!child.includes(val)) {
        child[currentChildIdx] = val;
        currentChildIdx = (currentChildIdx + 1) % N;
      }
    }
    return child;
  }

  return [buildChild(parent1, parent2), buildChild(parent2, parent1)];
}

// Cruzamiento PMX (Partially Mapped Crossover)
export function pmxCrossoverTSP(parent1: number[], parent2: number[]): [number[], number[]] {
  const N = parent1.length;
  let p1 = Math.floor(Math.random() * N);
  let p2 = Math.floor(Math.random() * N);
  if (p1 > p2) [p1, p2] = [p2, p1];

  function buildPMXChild(pA: number[], pB: number[]): number[] {
    const child = Array(N).fill(-1);
    for (let i = p1; i <= p2; i++) {
      child[i] = pA[i];
    }
    for (let i = p1; i <= p2; i++) {
      const valB = pB[i];
      if (!child.includes(valB)) {
        let pos = i;
        while (p1 <= pos && pos <= p2) {
          const valA = pA[pos];
          pos = pB.indexOf(valA);
        }
        child[pos] = valB;
      }
    }
    for (let i = 0; i < N; i++) {
      if (child[i] === -1) child[i] = pB[i];
    }
    return child;
  }

  return [buildPMXChild(parent1, parent2), buildPMXChild(parent2, parent1)];
}

// Operadores de Mutación
export function applyTSPMutation(
  route: number[],
  mutationRate: number,
  operator: 'swap' | 'inversion' | 'insertion' | 'bitflip' = 'swap'
): number[] {
  const res = [...route];
  if (Math.random() >= mutationRate) return res;

  const N = res.length;
  let i = Math.floor(Math.random() * N);
  let j = Math.floor(Math.random() * N);
  if (i > j) [i, j] = [j, i];

  if (operator === 'inversion') {
    // Invertir subvector entre i y j
    const sub = res.slice(i, j + 1).reverse();
    res.splice(i, sub.length, ...sub);
  } else if (operator === 'insertion') {
    // Extraer elemento i e insertarlo en la posición j
    const [item] = res.splice(i, 1);
    res.splice(j, 0, item);
  } else {
    // Swap o fallback
    [res[i], res[j]] = [res[j], res[i]];
  }

  return res;
}

function tournamentSelect(pop: Individual<number[]>[], size: number = 3): Individual<number[]> {
  let best = pop[Math.floor(Math.random() * pop.length)];
  for (let i = 1; i < size; i++) {
    const c = pop[Math.floor(Math.random() * pop.length)];
    if (c.fitness > best.fitness) best = c;
  }
  return best;
}

export function runTSPGA(cities: City[], params: GAParameters): GAResult<number[]> {
  const startTime = performance.now();
  const N = cities.length;
  const distMatrix = createDistanceMatrix(cities);
  const { popSize, maxGenerations, mutationRate, crossoverRate, elitismCount } = params;
  const crossoverOp = params.crossoverOperator || 'OX';
  const mutationOp = params.mutationOperator || 'swap';

  function randomRoute(): number[] {
    const arr = Array.from({ length: N }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let population = Array.from({ length: popSize }, () => evaluateTSP(randomRoute(), distMatrix));
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
      bestChromosome: [...bestCurrent.chromosome]
    });

    const newPop: Individual<number[]>[] = [];
    // Elitismo
    for (let e = 0; e < Math.min(elitismCount, popSize); e++) {
      newPop.push(population[e]);
    }

    while (newPop.length < popSize) {
      const p1 = tournamentSelect(population);
      const p2 = tournamentSelect(population);

      let c1 = [...p1.chromosome];
      let c2 = [...p2.chromosome];

      if (Math.random() < crossoverRate) {
        if (crossoverOp === 'PMX') {
          [c1, c2] = pmxCrossoverTSP(p1.chromosome, p2.chromosome);
        } else {
          [c1, c2] = orderCrossover(p1.chromosome, p2.chromosome);
        }
      }

      c1 = applyTSPMutation(c1, mutationRate, mutationOp);
      c2 = applyTSPMutation(c2, mutationRate, mutationOp);

      newPop.push(evaluateTSP(c1, distMatrix));
      if (newPop.length < popSize) {
        newPop.push(evaluateTSP(c2, distMatrix));
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
    solved: true
  };
}
