import { Individual, GAParameters, GAResult, GenerationLog } from './types';

export interface Course {
  id: number;
  name: string;
  code: string;
  students: number;
  reqSoftware: string[];
  blockedSlots: number[]; // Franjas no permitidas (0..4)
}

export interface LabRoom {
  id: number;
  name: string;
  capacity: number;
  pcs: number;
  installedSoftware: string[];
}

export interface SlotAssignment {
  labId: number;  // 0..3 (4 salas)
  slotId: number; // 0..4 (5 franjas)
}

// Datos por defecto sugeridos (8 Cursos, 4 Salas, 5 Franjas)
export const DEFAULT_COURSES: Course[] = [
  { id: 0, name: 'Inteligencia Artificial', code: 'IA-801', students: 35, reqSoftware: ['Python', 'GPU'], blockedSlots: [0] },
  { id: 1, name: 'Bases de Datos II', code: 'BD-402', students: 28, reqSoftware: ['PostgreSQL', 'Docker'], blockedSlots: [] },
  { id: 2, name: 'Visión por Computador', code: 'VC-703', students: 22, reqSoftware: ['Python', 'GPU', 'OpenCV'], blockedSlots: [4] },
  { id: 3, name: 'Redes y Seguridad', code: 'RS-501', students: 40, reqSoftware: ['Wireshark', 'Cisco'], blockedSlots: [2] },
  { id: 4, name: 'Sistemas Operativos', code: 'SO-302', students: 30, reqSoftware: ['Linux', 'C++'], blockedSlots: [] },
  { id: 5, name: 'Diseño Asistido (CAD)', code: 'CAD-601', students: 25, reqSoftware: ['AutoCAD', 'SolidWorks'], blockedSlots: [0, 1] },
  { id: 6, name: 'Machine Learning', code: 'ML-802', students: 38, reqSoftware: ['Python', 'GPU'], blockedSlots: [] },
  { id: 7, name: 'Programación Web', code: 'PW-201', students: 32, reqSoftware: ['NodeJS', 'VSCode'], blockedSlots: [3] },
];

export const DEFAULT_LABS: LabRoom[] = [
  { id: 0, name: 'Lab 101 - High Perf GPU', capacity: 42, pcs: 42, installedSoftware: ['Python', 'GPU', 'OpenCV', 'Docker', 'Linux', 'C++'] },
  { id: 1, name: 'Lab 102 - Redes & DB', capacity: 45, pcs: 45, installedSoftware: ['PostgreSQL', 'Docker', 'Wireshark', 'Cisco', 'Linux', 'NodeJS', 'VSCode'] },
  { id: 2, name: 'Lab 103 - CAD & Diseño', capacity: 30, pcs: 30, installedSoftware: ['AutoCAD', 'SolidWorks', 'VSCode', 'Python'] },
  { id: 3, name: 'Lab 104 - Estándar', capacity: 32, pcs: 32, installedSoftware: ['NodeJS', 'VSCode', 'C++', 'Python'] },
];

export const TIME_SLOTS = [
  { id: 0, name: '07:00 - 09:00' },
  { id: 1, name: '09:00 - 11:00' },
  { id: 2, name: '11:00 - 13:00' },
  { id: 3, name: '14:00 - 16:00' },
  { id: 4, name: '16:00 - 18:00' },
];

export interface CoursePenaltyBreakdown {
  totalPenalty: number;
  hardViolationsCount: number;
  softViolationsCount: number;
  details: {
    overcapacity: number;
    missingSoftware: number;
    collisions: number;
    blockedSlots: number;
    imbalancePenalty: number;
  };
}

export function evaluateCourseSchedule(
  chromosome: SlotAssignment[],
  courses: Course[] = DEFAULT_COURSES,
  labs: LabRoom[] = DEFAULT_LABS
): Individual<SlotAssignment[]> {
  let overcapacity = 0;
  let missingSoftware = 0;
  let collisions = 0;
  let blockedSlotPenalties = 0;
  let hardViolationsCount = 0;

  // Mapa para detectar colisiones (labId_slotId -> cursoId[])
  const slotOccupancy = new Map<string, number[]>();

  chromosome.forEach((assign, courseIdx) => {
    const course = courses[courseIdx];
    const lab = labs[assign.labId];
    const key = `${assign.labId}_${assign.slotId}`;

    // 1. Sobrecupo
    if (course.students > lab.capacity) {
      overcapacity += (course.students - lab.capacity) * 10;
      hardViolationsCount++;
    }

    // 2. Software faltante
    course.reqSoftware.forEach(req => {
      if (!lab.installedSoftware.includes(req)) {
        missingSoftware += 50;
        hardViolationsCount++;
      }
    });

    // 3. Franjas bloqueadas
    if (course.blockedSlots.includes(assign.slotId)) {
      blockedSlotPenalties += 60;
      hardViolationsCount++;
    }

    // Registrar ocupación
    if (!slotOccupancy.has(key)) {
      slotOccupancy.set(key, []);
    }
    slotOccupancy.get(key)!.push(courseIdx);
  });

  // 4. Traslapes (Colisiones)
  slotOccupancy.forEach((occupants) => {
    if (occupants.length > 1) {
      collisions += (occupants.length - 1) * 100;
      hardViolationsCount += (occupants.length - 1);
    }
  });

  // Restricción Blanda: Desbalance de uso entre laboratorios
  const labCounts = [0, 0, 0, 0];
  chromosome.forEach(a => labCounts[a.labId]++);
  const meanUsage = chromosome.length / labs.length;
  const variance = labCounts.reduce((acc, count) => acc + Math.pow(count - meanUsage, 2), 0) / labs.length;
  const imbalancePenalty = Math.round(variance * 5);

  const totalPenalty = overcapacity + missingSoftware + collisions + blockedSlotPenalties + imbalancePenalty;

  // Fitness para minimización: menor penalización -> mayor fitness
  const fitness = 1000 / (1 + totalPenalty);

  return {
    chromosome: [...chromosome],
    fitness,
    rawScore: totalPenalty,
    details: {
      totalPenalty,
      hardViolationsCount,
      softViolationsCount: Math.round(variance),
      details: {
        overcapacity,
        missingSoftware,
        collisions,
        blockedSlots: blockedSlotPenalties,
        imbalancePenalty
      }
    }
  };
}

// Operador opcional de Reparación para eliminar colisiones y franjas bloqueadas
export function repairCourseSchedule(
  chromosome: SlotAssignment[],
  courses: Course[] = DEFAULT_COURSES,
  labs: LabRoom[] = DEFAULT_LABS
): SlotAssignment[] {
  const repaired = chromosome.map(a => ({ ...a }));
  const usedSlots = new Set<string>();

  repaired.forEach((assign, courseIdx) => {
    const course = courses[courseIdx];
    let key = `${assign.labId}_${assign.slotId}`;
    const isValid = (lId: number, sId: number) => {
      const k = `${lId}_${sId}`;
      const lab = labs[lId];
      const hasCap = course.students <= lab.capacity;
      const hasSoft = course.reqSoftware.every(req => lab.installedSoftware.includes(req));
      const notBlocked = !course.blockedSlots.includes(sId);
      return hasCap && hasSoft && notBlocked && !usedSlots.has(k);
    };

    if (!isValid(assign.labId, assign.slotId)) {
      // Buscar una franja y sala libre adecuada
      let fixed = false;
      for (let l = 0; l < labs.length && !fixed; l++) {
        for (let s = 0; s < TIME_SLOTS.length && !fixed; s++) {
          if (isValid(l, s)) {
            repaired[courseIdx] = { labId: l, slotId: s };
            key = `${l}_${s}`;
            fixed = true;
          }
        }
      }
    }
    usedSlots.add(key);
  });

  return repaired;
}

// Cruzamiento uniforme
function uniformCrossover(
  parent1: SlotAssignment[],
  parent2: SlotAssignment[]
): [SlotAssignment[], SlotAssignment[]] {
  const N = parent1.length;
  const child1: SlotAssignment[] = [];
  const child2: SlotAssignment[] = [];

  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.5) {
      child1.push({ ...parent1[i] });
      child2.push({ ...parent2[i] });
    } else {
      child1.push({ ...parent2[i] });
      child2.push({ ...parent1[i] });
    }
  }
  return [child1, child2];
}

// Mutación
function mutateSchedule(
  chromosome: SlotAssignment[],
  mutationRate: number,
  numLabs: number = 4,
  numSlots: number = 5
): SlotAssignment[] {
  return chromosome.map(assign => {
    if (Math.random() < mutationRate) {
      return {
        labId: Math.floor(Math.random() * numLabs),
        slotId: Math.floor(Math.random() * numSlots)
      };
    }
    return { ...assign };
  });
}

function tournamentSelect(pop: Individual<SlotAssignment[]>[], size: number = 3): Individual<SlotAssignment[]> {
  let best = pop[Math.floor(Math.random() * pop.length)];
  for (let i = 1; i < size; i++) {
    const candidate = pop[Math.floor(Math.random() * pop.length)];
    if (candidate.fitness > best.fitness) best = candidate;
  }
  return best;
}

export function runCourseSchedulingGA(params: GAParameters): GAResult<SlotAssignment[]> {
  const startTime = performance.now();
  const { popSize, maxGenerations, mutationRate, crossoverRate, elitismCount, useRepair } = params;

  function randomChromosome(): SlotAssignment[] {
    return DEFAULT_COURSES.map(() => ({
      labId: Math.floor(Math.random() * DEFAULT_LABS.length),
      slotId: Math.floor(Math.random() * TIME_SLOTS.length)
    }));
  }

  let population = Array.from({ length: popSize }, () => {
    let chrom = randomChromosome();
    if (useRepair) chrom = repairCourseSchedule(chrom);
    return evaluateCourseSchedule(chrom);
  });

  const history: GenerationLog[] = [];
  let solved = false;

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

    if (bestCurrent.details?.hardViolationsCount === 0) {
      solved = true;
    }

    const newPop: Individual<SlotAssignment[]>[] = [];

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
        [c1, c2] = uniformCrossover(p1.chromosome, p2.chromosome);
      }

      c1 = mutateSchedule(c1, mutationRate);
      c2 = mutateSchedule(c2, mutationRate);

      if (useRepair) {
        c1 = repairCourseSchedule(c1);
        c2 = repairCourseSchedule(c2);
      }

      newPop.push(evaluateCourseSchedule(c1));
      if (newPop.length < popSize) {
        newPop.push(evaluateCourseSchedule(c2));
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
    solved: population[0].details?.hardViolationsCount === 0
  };
}
