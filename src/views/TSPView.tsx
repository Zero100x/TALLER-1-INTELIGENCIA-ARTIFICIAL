import React, { useState, useEffect, useRef } from 'react';
import { runTSPGA, getPresetCities, City, calculateRouteDistance, createDistanceMatrix } from '../ga/tspGA';
import { GAParameters, GAResult } from '../ga/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin, Navigation, RefreshCw, Layers, Sliders, Award } from 'lucide-react';

export const TSPView: React.FC = () => {
  const [numCities, setNumCities] = useState<8 | 10 | 15>(10);
  const [popSize, setPopSize] = useState<number>(60);
  const [mutationRate, setMutationRate] = useState<number>(0.1);
  const [crossoverOp, setCrossoverOp] = useState<'OX' | 'PMX'>('OX');
  const [mutationOp, setMutationOp] = useState<'swap' | 'inversion' | 'insertion'>('inversion');
  const [maxGenerations, setMaxGenerations] = useState<number>(250);
  const [elitismCount, setElitismCount] = useState<number>(3);

  const [gaResult, setGaResult] = useState<GAResult<number[]> | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [multiRunStats, setMultiRunStats] = useState<any | null>(null);

  const timerRef = useRef<any>(null);
  const cities = getPresetCities(numCities);

  const handleRunGA = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const params: GAParameters = {
      popSize,
      maxGenerations,
      mutationRate,
      crossoverRate: 0.85,
      elitismCount,
      selectionMethod: 'tournament',
      crossoverOperator: crossoverOp,
      mutationOperator: mutationOp
    };

    const res = runTSPGA(cities, params);
    setGaResult(res);
    setCurrentStep(res.history.length - 1);
  };

  const handleRunMultiTrial = () => {
    const runs = 10;
    const params: GAParameters = {
      popSize,
      maxGenerations,
      mutationRate,
      crossoverRate: 0.85,
      elitismCount,
      selectionMethod: 'tournament',
      crossoverOperator: crossoverOp,
      mutationOperator: mutationOp
    };

    const dists: number[] = [];
    for (let i = 0; i < runs; i++) {
      const r = runTSPGA(cities, params);
      dists.push(r.bestIndividual.rawScore);
    }

    const min = Math.min(...dists);
    const max = Math.max(...dists);
    const avg = dists.reduce((a, b) => a + b, 0) / runs;
    const variance = dists.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / runs;

    setMultiRunStats({
      numCities,
      mutationRate,
      mutationOp,
      crossoverOp,
      best: Math.round(min * 100) / 100,
      worst: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
      runs: dists
    });
  };

  useEffect(() => {
    handleRunGA();
  }, [numCities]);

  useEffect(() => {
    if (isPlaying && gaResult) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= gaResult.history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 40);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gaResult]);

  const currentFrame = gaResult?.history[currentStep];
  const currentRoute: number[] = currentFrame?.bestChromosome || [];

  return (
    <div className="space-y-6">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-lg border-b border-slate-700 pb-2">
            <Sliders className="w-5 h-5" />
            <span>Parámetros del Agente Viajero</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Número de Ciudades: {numCities}</label>
              <div className="flex space-x-2 mt-1">
                {[8, 10, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumCities(n as any)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition ${
                      numCities === n
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {n} Ciudades
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">Operador Cruzamiento</label>
                <select
                  value={crossoverOp}
                  onChange={e => setCrossoverOp(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                >
                  <option value="OX">OX (Order Crossover)</option>
                  <option value="PMX">PMX (Partially Mapped)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Operador Mutación</label>
                <select
                  value={mutationOp}
                  onChange={e => setMutationOp(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200"
                >
                  <option value="inversion">Inversión (Inversion)</option>
                  <option value="swap">Intercambio (Swap)</option>
                  <option value="insertion">Inserción (Insertion)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Tasa de Mutación: {mutationRate}</label>
              <div className="flex space-x-2 mt-1">
                {[0.05, 0.1, 0.2].map(r => (
                  <button
                    key={r}
                    onClick={() => setMutationRate(r)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                      mutationRate === r
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {r * 100}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Tamaño de Población: {popSize}</label>
              <input
                type="range"
                min="30"
                max="200"
                step="10"
                value={popSize}
                onChange={e => setPopSize(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={handleRunGA}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Optimizar Ruta Individual</span>
              </button>

              <button
                onClick={handleRunMultiTrial}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ejecutar 10 Corridas (Estadísticas)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2D Map Canvas SVG */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-indigo-400" />
              <span className="text-slate-200 font-semibold text-lg">Mapa de Ruta Colombia (2D)</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Distancia Total Óptima</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {currentFrame?.bestRawScore ? `${currentFrame.bestRawScore} km` : '---'}
              </span>
            </div>
          </div>

          {/* Map Display SVG */}
          <div className="relative py-2 flex justify-center items-center">
            <svg
              viewBox="0 0 420 540"
              className="w-full max-w-md h-80 bg-slate-900 border border-slate-700 rounded-lg shadow-inner"
            >
              {/* Lines Connecting Cities in Route */}
              {currentRoute.length > 0 &&
                currentRoute.map((cityIdx, idx) => {
                  const nextCityIdx = currentRoute[(idx + 1) % currentRoute.length];
                  const c1 = cities[cityIdx];
                  const c2 = cities[nextCityIdx];

                  return (
                    <line
                      key={`route-${idx}`}
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeDasharray={idx === currentRoute.length - 1 ? "4 4" : "none"}
                    />
                  );
                })}

              {/* City Markers */}
              {cities.map((city, idx) => {
                const isSelectedInRoute = currentRoute.includes(city.id);
                return (
                  <g key={city.id} className="cursor-pointer">
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r="7"
                      className="fill-indigo-500 stroke-slate-900 stroke-2 hover:fill-amber-400 transition"
                    />
                    <text
                      x={city.x + 10}
                      y={city.y + 4}
                      fill="#e2e8f0"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Route Sequence Preview */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 overflow-x-auto whitespace-nowrap">
            <span className="text-slate-500 mr-2 font-bold">RUTA:</span>
            {currentRoute.map((cIdx, i) => (
              <React.Fragment key={i}>
                <span className="text-indigo-300 font-semibold">{cities[cIdx]?.name}</span>
                {i < currentRoute.length - 1 ? <span className="text-slate-600 mx-1">→</span> : <span className="text-emerald-400 mx-1">↺</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Run Statistics Modal/Panel if generated */}
      {multiRunStats && (
        <div className="bg-slate-800 border border-indigo-500/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-md border-b border-slate-700 pb-2">
            <Award className="w-5 h-5" />
            <span>Resultados de Benchmark (10 Corridas Independientes)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Mejor Distancia</p>
              <p className="text-lg font-mono font-bold text-emerald-400">{multiRunStats.best} km</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Peor Distancia</p>
              <p className="text-lg font-mono font-bold text-rose-400">{multiRunStats.worst} km</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Promedio</p>
              <p className="text-lg font-mono font-bold text-indigo-400">{multiRunStats.avg} km</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Desviación Estándar</p>
              <p className="text-lg font-mono font-bold text-violet-400">±{multiRunStats.stdDev} km</p>
            </div>
          </div>
        </div>
      )}

      {/* Fitness History Chart */}
      {gaResult && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
          <h3 className="text-md font-semibold text-slate-200 mb-4">
            Curva de Minimización de Distancia Total (Generaciones)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gaResult.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="generation" stroke="#94a3b8" />
                <YAxis stroke="#818cf8" label={{ value: 'Distancia (km)', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="bestRawScore" name="Mejor Ruta (km)" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
