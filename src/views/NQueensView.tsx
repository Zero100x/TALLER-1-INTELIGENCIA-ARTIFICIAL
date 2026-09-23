import React, { useState, useEffect, useRef } from 'react';
import { runNQueensGA, QueenConflictDetails, countQueenConflicts } from '../ga/nqueensGA';
import { GAParameters, GAResult } from '../ga/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, Zap, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export const NQueensView: React.FC = () => {
  const [boardSize, setBoardSize] = useState<number>(8);
  const [popSize, setPopSize] = useState<number>(50);
  const [mutationRate, setMutationRate] = useState<number>(0.1);
  const [maxGenerations, setMaxGenerations] = useState<number>(150);
  const [elitismCount, setElitismCount] = useState<number>(2);

  const [gaResult, setGaResult] = useState<GAResult<number[]> | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(50); // ms per step

  const timerRef = useRef<any>(null);

  const handleRunGA = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const params: GAParameters = {
      popSize,
      maxGenerations,
      mutationRate,
      crossoverRate: 0.85,
      elitismCount,
      selectionMethod: 'tournament'
    };

    const res = runNQueensGA(boardSize, params);
    setGaResult(res);
    setCurrentStep(res.history.length - 1);
  };

  useEffect(() => {
    handleRunGA();
  }, [boardSize]);

  useEffect(() => {
    if (isPlaying && gaResult) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= gaResult.history.length - 1) {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gaResult, playbackSpeed]);

  const currentFrame = gaResult?.history[currentStep];
  const currentChromosome: number[] = currentFrame?.bestChromosome || [];
  const conflictInfo: QueenConflictDetails = currentChromosome.length
    ? countQueenConflicts(currentChromosome)
    : { totalConflicts: 0, conflictingPairs: [] };

  const isPairConflicting = (c1: number, r1: number, c2: number, r2: number) => {
    return c1 !== c2 && (r1 === r2 || Math.abs(c1 - c2) === Math.abs(r1 - r2));
  };

  const isQueenConflicting = (col: number, row: number) => {
    if (currentChromosome[col] !== row) return false;
    for (let c = 0; c < boardSize; c++) {
      if (c !== col && isPairConflicting(col, row, c, currentChromosome[c])) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Param Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-lg border-b border-slate-700 pb-2">
            <Cpu className="w-5 h-5" />
            <span>Parámetros del Algoritmo</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Tamaño del Tablero (N): {boardSize}</label>
              <div className="flex space-x-2 mt-1">
                {[6, 8, 10, 12].map(n => (
                  <button
                    key={n}
                    onClick={() => setBoardSize(n)}
                    className={`px-3 py-1 text-sm rounded-lg font-medium transition ${
                      boardSize === n
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    N={n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Tamaño de Población: {popSize}</label>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={popSize}
                onChange={e => setPopSize(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
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
                    {r * 100}% ({r})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Generaciones Máximas: {maxGenerations}</label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxGenerations}
                onChange={e => setMaxGenerations(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Individuos Elitistas: {elitismCount}</label>
              <input
                type="range"
                min="0"
                max="5"
                value={elitismCount}
                onChange={e => setElitismCount(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunGA}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition transform active:scale-98"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Ejecutar Algoritmo Genético</span>
            </button>
          </div>
        </div>

        {/* Visualizer Chessboard */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-slate-200 font-semibold text-lg">Tablero N-Reinas ({boardSize}×{boardSize})</span>
              {currentFrame?.bestRawScore === 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Solución Óptima
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-400 border border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {currentFrame?.bestRawScore} Conflictos
                </span>
              )}
            </div>

            {/* Playback Controls */}
            {gaResult && (
              <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Reiniciar a Gen 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 text-indigo-400 hover:text-white rounded hover:bg-slate-800"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-indigo-400" />}
                </button>
                <span className="text-xs font-mono text-slate-400 px-2">
                  Gen: {currentStep} / {gaResult.history.length - 1}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Chessboard Display */}
          <div className="py-4 flex justify-center items-center">
            <div
              className="grid border-2 border-slate-600 rounded-lg overflow-hidden shadow-2xl"
              style={{
                gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                width: 'min(100%, 380px)',
                height: 'min(100%, 380px)',
              }}
            >
              {Array.from({ length: boardSize }).map((_, row) =>
                Array.from({ length: boardSize }).map((_, col) => {
                  const isBlack = (row + col) % 2 === 1;
                  const hasQueen = currentChromosome[col] === row;
                  const isConflict = hasQueen && isQueenConflicting(col, row);

                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`relative flex items-center justify-center text-xl sm:text-2xl font-bold transition-all ${
                        isBlack ? 'bg-slate-700' : 'bg-slate-600'
                      } ${isConflict ? 'ring-4 ring-rose-500 bg-rose-900/60 z-10' : ''}`}
                    >
                      {hasQueen && (
                        <span className={`transform transition duration-300 hover:scale-125 ${isConflict ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                          ♛
                        </span>
                      )}
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-slate-400 opacity-40">
                        {col},{row}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-center bg-slate-900/80 p-3 rounded-lg border border-slate-700">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Generación Actual</p>
              <p className="text-lg font-mono font-bold text-indigo-400">{currentStep}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Conflictos Diagonales</p>
              <p className={`text-lg font-mono font-bold ${conflictInfo.totalConflicts === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {conflictInfo.totalConflicts}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Aptitud (Fitness)</p>
              <p className="text-lg font-mono font-bold text-violet-400">
                {currentFrame?.bestFitness.toFixed(4) || '0.0000'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Vector Output */}
      {gaResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <h3 className="text-md font-semibold text-slate-200 mb-4 flex items-center justify-between">
              <span>Curva de Evolución de Conflictos y Fitness</span>
              <span className="text-xs text-slate-400">Tiempo de cómputo: {gaResult.executionTimeMs} ms</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gaResult.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="generation" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#818cf8" label={{ value: 'Fitness', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" label={{ value: 'Conflictos', angle: 90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="bestFitness" name="Mejor Fitness" stroke="#818cf8" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="avgFitness" name="Fitness Promedio" stroke="#a78bfa" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="bestRawScore" name="Conflictos (Min)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
              Representación del Cromosoma
            </h3>
            <div>
              <p className="text-xs text-slate-400 mb-2">
                Vector de tamaño N={boardSize} [columna = índice, fila = valor]:
              </p>
              <div className="p-3 bg-slate-900 font-mono text-sm rounded-lg border border-slate-700 text-emerald-400 break-all overflow-x-auto">
                [{currentChromosome.join(', ')}]
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">Análisis del Diagnóstico:</p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Garantía de no conflicto por columnas y filas por representación de permutación.</li>
                <li>Conflictos diagonales monitoreados en tiempo real.</li>
                <li>Tasa de mutación {mutationRate * 100}% previene convergencia prematura.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
