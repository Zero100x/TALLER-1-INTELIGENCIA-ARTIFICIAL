import { MultiRunStats, GAParameters, GAResult } from './types';
import { runNQueensGA } from './nqueensGA';
import { runTSPGA, getPresetCities } from './tspGA';
import { runCourseSchedulingGA } from './courseGA';
import { runKnapsackGA, DEFAULT_KNAPSACK_ITEMS } from './knapsackGA';

export function runMultiTrialBenchmark(
  problem: 'nqueens' | 'tsp' | 'course' | 'knapsack',
  params: GAParameters,
  problemSpecificConfig: any = {},
  numRuns: number = 10
): MultiRunStats {
  const runResults: Array<{
    run: number;
    bestRawScore: number;
    generations: number;
    timeMs: number;
    solved: boolean;
  }> = [];

  for (let r = 1; r <= numRuns; r++) {
    let result: GAResult<any>;

    if (problem === 'nqueens') {
      const N = problemSpecificConfig.N || 8;
      result = runNQueensGA(N, params);
    } else if (problem === 'tsp') {
      const numCities = problemSpecificConfig.numCities || 10;
      const cities = getPresetCities(numCities as 8 | 10 | 15);
      result = runTSPGA(cities, params);
    } else if (problem === 'course') {
      result = runCourseSchedulingGA(params);
    } else {
      const capacity = problemSpecificConfig.capacity || 50;
      result = runKnapsackGA(capacity, params, DEFAULT_KNAPSACK_ITEMS);
    }

    runResults.push({
      run: r,
      bestRawScore: result.bestIndividual.rawScore,
      generations: result.generationsRun,
      timeMs: result.executionTimeMs,
      solved: result.solved
    });
  }

  const rawScores = runResults.map(r => r.bestRawScore);
  const bestRawScore = Math.min(...rawScores); // Nota: Para Mochila, el valor es mayor, para TSP/Reinas/Curso es menor
  const worstRawScore = Math.max(...rawScores);
  const avgRawScore = rawScores.reduce((a, b) => a + b, 0) / numRuns;

  const variance = rawScores.reduce((acc, score) => acc + Math.pow(score - avgRawScore, 2), 0) / numRuns;
  const stdDevRawScore = Math.sqrt(variance);

  const avgGenerations = runResults.reduce((a, r) => a + r.generations, 0) / numRuns;
  const successCount = runResults.filter(r => r.solved).length;

  return {
    problemName: problem.toUpperCase(),
    configSummary: `Pop=${params.popSize}, Mut=${params.mutationRate}, Gen=${params.maxGenerations}, Elitism=${params.elitismCount}, Repair=${Boolean(params.useRepair)}`,
    runs: numRuns,
    bestRawScore: Math.round(bestRawScore * 100) / 100,
    worstRawScore: Math.round(worstRawScore * 100) / 100,
    avgRawScore: Math.round(avgRawScore * 100) / 100,
    stdDevRawScore: Math.round(stdDevRawScore * 100) / 100,
    avgGenerations: Math.round(avgGenerations * 10) / 10,
    successRatePercentage: Math.round((successCount / numRuns) * 100),
    runDetails: runResults
  };
}
