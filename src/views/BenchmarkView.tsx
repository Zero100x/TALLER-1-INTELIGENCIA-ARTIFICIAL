import React, { useState } from 'react';
import { runMultiTrialBenchmark } from '../ga/benchmarkRunner';
import { MultiRunStats, GAParameters } from '../ga/types';
import { BarChart3, Play, Download, CheckCircle2, ShieldAlert } from 'lucide-react';

export const BenchmarkView: React.FC = () => {
  const [numRuns, setNumRuns] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<MultiRunStats[]>([]);

  const handleRunAllBenchmarks = () => {
    setIsRunning(true);
    setTimeout(() => {
      const baseParams: GAParameters = {
        popSize: 50,
        maxGenerations: 200,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        elitismCount: 2,
        selectionMethod: 'tournament'
      };

      const resNQueens = runMultiTrialBenchmark('nqueens', baseParams, { N: 8 }, numRuns);
      const resTSP = runMultiTrialBenchmark('tsp', { ...baseParams, mutationOperator: 'inversion' }, { numCities: 10 }, numRuns);
      const resCourse = runMultiTrialBenchmark('course', baseParams, {}, numRuns);
      const resKnapsack = runMultiTrialBenchmark('knapsack', { ...baseParams, useRepair: true }, { capacity: 50 }, numRuns);

      setResults([resNQueens, resTSP, resCourse, resKnapsack]);
      setIsRunning(false);
    }, 100);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "benchmark_resultados_ga.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-indigo-400" />
            Módulo de Benchmarking Multi-Corrida (Estadísticas N={numRuns})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ejecuta {numRuns} corridas independientes para cada uno de los 4 problemas y calcula el mejor, peor, promedio y desviación estándar.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Corridas:</span>
            <select
              value={numRuns}
              onChange={e => setNumRuns(Number(e.target.value))}
              className="bg-slate-800 text-sm font-bold text-indigo-300 rounded p-1 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <button
            onClick={handleRunAllBenchmarks}
            disabled={isRunning}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg flex items-center space-x-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'Ejecutando...' : 'Lanzar Benchmark Completo'}</span>
          </button>
        </div>
      </div>

      {/* Results Tables */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Exportar Resultados a JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((res, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h3 className="font-bold text-slate-100 text-base">{res.problemName}</h3>
                  <span className="text-[11px] text-indigo-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {res.runs} Corridas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mejor</span>
                    <span className="text-base font-mono font-bold text-emerald-400">{res.bestRawScore}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Peor</span>
                    <span className="text-base font-mono font-bold text-rose-400">{res.worstRawScore}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Promedio</span>
                    <span className="text-base font-mono font-bold text-indigo-300">{res.avgRawScore}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Desv. Estándar</span>
                    <span className="text-base font-mono font-bold text-violet-400">±{res.stdDevRawScore}</span>
                  </div>
                </div>

                {/* Individual Runs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                        <th className="p-1.5">Corrida #</th>
                        <th className="p-1.5">Score Real</th>
                        <th className="p-1.5">Generaciones</th>
                        <th className="p-1.5">Tiempo (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.runDetails.map(rd => (
                        <tr key={rd.run} className="border-b border-slate-700/50 hover:bg-slate-750 font-mono">
                          <td className="p-1.5">Run {rd.run}</td>
                          <td className="p-1.5 font-bold text-indigo-300">{rd.bestRawScore}</td>
                          <td className="p-1.5">{rd.generations}</td>
                          <td className="p-1.5 text-slate-400">{rd.timeMs} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
