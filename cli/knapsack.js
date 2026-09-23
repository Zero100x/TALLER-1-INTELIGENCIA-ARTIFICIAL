import { runKnapsackGA, DEFAULT_KNAPSACK_ITEMS } from '../src/ga/knapsackGA.js';

console.log("=== EJERCICIO 3: PROBLEMA DE LA MOCHILA (KNAPSACK) ===");

[50, 80].forEach(capacity => {
  console.log(`\n--- Capacidad de Mochila: ${capacity} kg ---`);

  [false, true].forEach(useRepair => {
    const runs = 10;
    const values = [];
    const weights = [];

    for (let r = 0; r < runs; r++) {
      const res = runKnapsackGA(capacity, {
        popSize: 40,
        maxGenerations: 150,
        mutationRate: 0.08,
        crossoverRate: 0.8,
        elitismCount: 2,
        selectionMethod: 'tournament',
        useRepair
      }, DEFAULT_KNAPSACK_ITEMS);

      values.push(res.bestIndividual.details.totalValue);
      weights.push(res.bestIndividual.details.totalWeight);
    }

    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const avgVal = values.reduce((a, b) => a + b, 0) / runs;
    const avgW = weights.reduce((a, b) => a + b, 0) / runs;

    console.log(`Estrategia=${useRepair ? 'REPARACIÓN' : 'PENALIZACIÓN'} => ` +
      `Mejor Valor=$${maxVal} | Peor=$${minVal} | Promedio Valor=$${avgVal.toFixed(2)} | Peso Promedio=${avgW.toFixed(1)}kg`);
  });
});
