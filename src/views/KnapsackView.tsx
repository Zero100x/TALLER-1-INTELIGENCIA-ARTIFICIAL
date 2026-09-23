import React, { useState, useEffect } from 'react';
import { runKnapsackGA, DEFAULT_KNAPSACK_ITEMS, KnapsackItem } from '../ga/knapsackGA';
import { GAParameters, GAResult } from '../ga/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, Scale, ShieldAlert, Sparkles, Check, X, ArrowRightLeft } from 'lucide-react';

export const KnapsackView: React.FC = () => {
  const [capacity, setCapacity] = useState<number>(50);
  const [popSize, setPopSize] = useState<number>(40);
  const [mutationRate, setMutationRate] = useState<number>(0.08);
  const [useRepair, setUseRepair] = useState<boolean>(true);
  const [maxGenerations, setMaxGenerations] = useState<number>(150);
  const [elitismCount, setElitismCount] = useState<number>(2);

  const [gaResult, setGaResult] = useState<GAResult<number[]> | null>(null);
  const [strategyComparison, setStrategyComparison] = useState<any | null>(null);

  const handleRunGA = () => {
    const params: GAParameters = {
      popSize,
      maxGenerations,
      mutationRate,
      crossoverRate: 0.8,
      elitismCount,
      selectionMethod: 'tournament',
      useRepair
    };

    const res = runKnapsackGA(capacity, params, DEFAULT_KNAPSACK_ITEMS);
    setGaResult(res);
  };

  const handleCompareStrategies = () => {
    const runs = 10;
    const penaltyValues: number[] = [];
    const penaltyWeights: number[] = [];
    const repairValues: number[] = [];
    const repairWeights: number[] = [];

    for (let r = 0; r < runs; r++) {
      const resP = runKnapsackGA(capacity, {
        popSize,
        maxGenerations,
        mutationRate,
        crossoverRate: 0.8,
        elitismCount: 2,
        selectionMethod: 'tournament',
        useRepair: false
      }, DEFAULT_KNAPSACK_ITEMS);
      penaltyValues.push(resP.bestIndividual.details.totalValue);
      penaltyWeights.push(resP.bestIndividual.details.totalWeight);

      const resR = runKnapsackGA(capacity, {
        popSize,
        maxGenerations,
        mutationRate,
        crossoverRate: 0.8,
        elitismCount: 2,
        selectionMethod: 'tournament',
        useRepair: true
      }, DEFAULT_KNAPSACK_ITEMS);
      repairValues.push(resR.bestIndividual.details.totalValue);
      repairWeights.push(resR.bestIndividual.details.totalWeight);
    }

    setStrategyComparison({
      penalty: {
        bestVal: Math.max(...penaltyValues),
        avgVal: Math.round((penaltyValues.reduce((a, b) => a + b, 0) / runs) * 10) / 10,
        avgWeight: Math.round((penaltyWeights.reduce((a, b) => a + b, 0) / runs) * 10) / 10
      },
      repair: {
        bestVal: Math.max(...repairValues),
        avgVal: Math.round((repairValues.reduce((a, b) => a + b, 0) / runs) * 10) / 10,
        avgWeight: Math.round((repairWeights.reduce((a, b) => a + b, 0) / runs) * 10) / 10
      }
    });
  };

  useEffect(() => {
    handleRunGA();
  }, [capacity, useRepair]);

  const bestChromosome: number[] = gaResult?.bestIndividual.chromosome || [];
  const details = gaResult?.bestIndividual.details || { totalWeight: 0, totalValue: 0, isOverweight: false };
  const fillPercentage = Math.min(100, Math.round((details.totalWeight / capacity) * 100));

  return (
    <div className="space-y-6">
      {/* Parameters and Capacity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Param Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-lg border-b border-slate-700 pb-2">
            <Package className="w-5 h-5" />
            <span>Configuración de la Mochila</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Capacidad Máxima (W_max): {capacity} kg</label>
              <div className="flex space-x-2 mt-1">
                {[50, 80].map(cap => (
                  <button
                    key={cap}
                    onClick={() => setCapacity(cap)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition ${
                      capacity === cap
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Capacidad={cap} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-xs font-semibold text-slate-300">Estrategia de Solución</span>
              <button
                onClick={() => setUseRepair(!useRepair)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  useRepair ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {useRepair ? 'REPARACIÓN VORAZ' : 'PENALIZACIÓN'}
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Tasa de Mutación (Bit-Flip): {mutationRate}</label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={mutationRate}
                onChange={e => setMutationRate(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunGA}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Optimizar Selección de Objetos</span>
            </button>

            <button
              onClick={handleCompareStrategies}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Comparar Penalización vs Reparación</span>
            </button>
          </div>
        </div>

        {/* Weight Gauge & Summary */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <span className="text-slate-200 font-semibold text-lg flex items-center">
              <Scale className="w-5 h-5 mr-2 text-indigo-400" />
              Estado de Carga de la Mochila
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Valor Total Conseguido</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">${details.totalValue}</span>
            </div>
          </div>

          {/* Progress Bar Gauge */}
          <div className="space-y-2 py-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Peso Acumulado: {details.totalWeight} kg / {capacity} kg</span>
              <span className={details.isOverweight ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {fillPercentage}% Utilizado {details.isOverweight ? '(SOBREPESO!)' : ''}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  details.isOverweight
                    ? 'bg-rose-500'
                    : fillPercentage > 90
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Comparison Panel if executed */}
          {strategyComparison && (
            <div className="bg-slate-900 border border-indigo-500/40 p-3.5 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-indigo-300">Comparativa Penalización vs Reparación (10 Corridas):</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-2 rounded border border-amber-600/30">
                  <span className="font-bold text-amber-400">Estrategia de PENALIZACIÓN:</span>
                  <p className="text-slate-300 mt-1">Valor Promedio: <b>${strategyComparison.penalty.avgVal}</b> (Max: ${strategyComparison.penalty.bestVal})</p>
                  <p className="text-slate-400">Peso Promediar: {strategyComparison.penalty.avgWeight} kg</p>
                </div>
                <div className="bg-slate-800 p-2 rounded border border-emerald-600/30">
                  <span className="font-bold text-emerald-400">Estrategia de REPARACIÓN:</span>
                  <p className="text-slate-300 mt-1">Valor Promedio: <b>${strategyComparison.repair.avgVal}</b> (Max: ${strategyComparison.repair.bestVal})</p>
                  <p className="text-slate-400">Peso Promediar: {strategyComparison.repair.avgWeight} kg</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Inventory Grid */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2 flex items-center justify-between">
          <span>Inventario de Objetos (15 Objetos Disponibles)</span>
          <span className="text-xs text-slate-400">Cromosoma Binario: Gen 1 = Incluido, 0 = Excluido</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {DEFAULT_KNAPSACK_ITEMS.map((item, idx) => {
            const isSelected = bestChromosome[idx] === 1;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">{item.category}</span>
                  {isSelected ? (
                    <span className="p-0.5 bg-emerald-500 text-slate-950 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="p-0.5 bg-slate-800 text-slate-600 rounded-full">
                      <X className="w-3 h-3 stroke-[2]" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold truncate">{item.name}</h4>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-700/50 text-xs font-mono">
                  <span className="text-amber-300 font-bold">{item.weight} kg</span>
                  <span className="text-emerald-300 font-bold">${item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fitness History Chart */}
      {gaResult && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-md font-semibold text-slate-200 mb-4">
            Curva de Maximización del Valor de la Mochila (Generaciones)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gaResult.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="generation" stroke="#94a3b8" />
                <YAxis stroke="#10b981" label={{ value: 'Valor ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="bestRawScore" name="Mejor Valor ($)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
