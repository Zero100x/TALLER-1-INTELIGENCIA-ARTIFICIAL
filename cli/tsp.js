import { runTSPGA, getPresetCities } from '../src/ga/tspGA.js';

console.log("=== EJERCICIO 1: PROBLEMA DEL AGENTE VIAJERO (TSP) ===");

[8, 10, 15].forEach(numCities => {
  const cities = getPresetCities(numCities);
  console.log(`\n--- Evaluación para ${numCities} ciudades ---`);

  [0.05, 0.2].forEach(mutRate => {
    const runs = 10;
    const distances = [];

    for (let r = 0; r < runs; r++) {
      const res = runTSPGA(cities, {
        popSize: 60,
        maxGenerations: 250,
        mutationRate: mutRate,
        crossoverRate: 0.85,
        elitismCount: 3,
        selectionMethod: 'tournament',
        crossoverOperator: 'OX',
        mutationOperator: 'inversion'
      });
      distances.push(res.bestIndividual.rawScore);
    }

    const min = Math.min(...distances);
    const max = Math.max(...distances);
    const avg = distances.reduce((a, b) => a + b, 0) / runs;
    console.log(`Mutación=${mutRate} => Mejor=${min} km | Peor=${max} km | Promedio=${avg.toFixed(2)} km`);
  });
});
