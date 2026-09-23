import { runNQueensGA } from '../src/ga/nqueensGA.js';

console.log("=== EJECUCIÓN PROBLEMA BASE: N-REINAS ===");

const configs = [
  { N: 6, popSize: 30, mutationRate: 0.05 },
  { N: 6, popSize: 30, mutationRate: 0.1 },
  { N: 6, popSize: 30, mutationRate: 0.2 },
  { N: 8, popSize: 50, mutationRate: 0.05 },
  { N: 8, popSize: 50, mutationRate: 0.1 },
  { N: 8, popSize: 50, mutationRate: 0.2 },
];

configs.forEach(cfg => {
  const result = runNQueensGA(cfg.N, {
    popSize: cfg.popSize,
    maxGenerations: 200,
    mutationRate: cfg.mutationRate,
    crossoverRate: 0.8,
    elitismCount: 2,
    selectionMethod: 'tournament'
  });

  console.log(`N=${cfg.N} | Pop=${cfg.popSize} | Mut=${cfg.mutationRate} => ` +
    `Conflictos=${result.bestIndividual.rawScore} | Generaciones=${result.generationsRun} | Resuelto=${result.solved ? 'SÍ' : 'NO'}`);
  console.log(`  Vector solución: [${result.bestIndividual.chromosome.join(', ')}]`);
});
