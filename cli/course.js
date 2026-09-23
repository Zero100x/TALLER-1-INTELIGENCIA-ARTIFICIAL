import { runCourseSchedulingGA } from '../src/ga/courseGA.js';

console.log("=== EJERCICIO 2: ASIGNACIÓN DE CURSOS A SALAS DE CÓMPUTO ===");

console.log("\n--- Comparación Con Elitismo vs Sin Elitismo ---");
[true, false].forEach(useElitism => {
  const runs = 10;
  const penalties = [];

  for (let r = 0; r < runs; r++) {
    const res = runCourseSchedulingGA({
      popSize: 50,
      maxGenerations: 200,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismCount: useElitism ? 2 : 0,
      selectionMethod: 'tournament',
      useRepair: false
    });
    penalties.push(res.bestIndividual.rawScore);
  }

  const min = Math.min(...penalties);
  const max = Math.max(...penalties);
  const avg = penalties.reduce((a, b) => a + b, 0) / runs;
  console.log(`Elitismo=${useElitism ? 'SÍ (count=2)' : 'NO (count=0)'} => ` +
    `Mejor Penalización=${min} | Peor=${max} | Promedio=${avg.toFixed(2)}`);
});
