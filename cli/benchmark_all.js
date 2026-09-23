import { runMultiTrialBenchmark } from '../src/ga/benchmarkRunner.js';

console.log("==========================================================");
console.log("   BENCHMARK GENERAL DE ALGORITMOS GENÉTICOS - TALLER 1   ");
console.log("==========================================================\n");

const baseParams = {
  popSize: 50,
  maxGenerations: 200,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismCount: 2,
  selectionMethod: 'tournament'
};

console.log("1. EJECUTANDO N-REINAS (N=8, 10 Corridas)...");
const nqueensStats = runMultiTrialBenchmark('nqueens', baseParams, { N: 8 }, 10);
console.table({
  'Mejor Conflictos': nqueensStats.bestRawScore,
  'Peor Conflictos': nqueensStats.worstRawScore,
  'Promedio Conflictos': nqueensStats.avgRawScore,
  'Desv. Estándar': nqueensStats.stdDevRawScore,
  'Tasa Éxito Solución %': nqueensStats.successRatePercentage
});

console.log("\n2. EJECUTANDO TSP (10 Ciudades, 10 Corridas)...");
const tspStats = runMultiTrialBenchmark('tsp', { ...baseParams, mutationOperator: 'inversion' }, { numCities: 10 }, 10);
console.table({
  'Mejor Distancia (km)': tspStats.bestRawScore,
  'Peor Distancia (km)': tspStats.worstRawScore,
  'Promedio Distancia': tspStats.avgRawScore,
  'Desv. Estándar': tspStats.stdDevRawScore
});

console.log("\n3. EJECUTANDO ASIGNACIÓN DE CURSOS (10 Corridas)...");
const courseStats = runMultiTrialBenchmark('course', baseParams, {}, 10);
console.table({
  'Mejor Penalización': courseStats.bestRawScore,
  'Peor Penalización': courseStats.worstRawScore,
  'Promedio Penalización': courseStats.avgRawScore,
  'Desv. Estándar': courseStats.stdDevRawScore,
  'Horarios Válidos %': courseStats.successRatePercentage
});

console.log("\n4. EJECUTANDO MOCHILA (Capacidad 50, Reparación, 10 Corridas)...");
const knapsackStats = runMultiTrialBenchmark('knapsack', { ...baseParams, useRepair: true }, { capacity: 50 }, 10);
console.table({
  'Mejor Valor ($)': knapsackStats.bestRawScore,
  'Peor Valor ($)': knapsackStats.worstRawScore,
  'Promedio Valor ($)': knapsackStats.avgRawScore,
  'Desv. Estándar': knapsackStats.stdDevRawScore
});

console.log("\n¡Benchmark finalizado con éxito!");
