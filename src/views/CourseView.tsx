import React, { useState, useEffect } from 'react';
import { runCourseSchedulingGA, DEFAULT_COURSES, DEFAULT_LABS, TIME_SLOTS, SlotAssignment } from '../ga/courseGA';
import { GAParameters, GAResult } from '../ga/types';
import { Calendar, Building2, CheckCircle2, AlertOctagon, Scale, Sparkles, Layers } from 'lucide-react';

export const CourseView: React.FC = () => {
  const [popSize, setPopSize] = useState<number>(50);
  const [mutationRate, setMutationRate] = useState<number>(0.1);
  const [useElitism, setUseElitism] = useState<boolean>(true);
  const [useRepair, setUseRepair] = useState<boolean>(false);
  const [maxGenerations, setMaxGenerations] = useState<number>(200);

  const [gaResult, setGaResult] = useState<GAResult<SlotAssignment[]> | null>(null);
  const [elitismComparison, setElitismComparison] = useState<any | null>(null);

  const handleRunGA = () => {
    const params: GAParameters = {
      popSize,
      maxGenerations,
      mutationRate,
      crossoverRate: 0.8,
      elitismCount: useElitism ? 2 : 0,
      selectionMethod: 'tournament',
      useRepair
    };

    const res = runCourseSchedulingGA(params);
    setGaResult(res);
  };

  const handleCompareElitism = () => {
    const runs = 10;
    const withElitismPenalties: number[] = [];
    const withoutElitismPenalties: number[] = [];

    for (let r = 0; r < runs; r++) {
      const resWith = runCourseSchedulingGA({
        popSize,
        maxGenerations,
        mutationRate,
        crossoverRate: 0.8,
        elitismCount: 2,
        selectionMethod: 'tournament',
        useRepair: false
      });
      withElitismPenalties.push(resWith.bestIndividual.rawScore);

      const resWithout = runCourseSchedulingGA({
        popSize,
        maxGenerations,
        mutationRate,
        crossoverRate: 0.8,
        elitismCount: 0,
        selectionMethod: 'tournament',
        useRepair: false
      });
      withoutElitismPenalties.push(resWithout.bestIndividual.rawScore);
    }

    const avgWith = withElitismPenalties.reduce((a, b) => a + b, 0) / runs;
    const avgWithout = withoutElitismPenalties.reduce((a, b) => a + b, 0) / runs;

    setElitismComparison({
      withElitism: {
        best: Math.min(...withElitismPenalties),
        worst: Math.max(...withElitismPenalties),
        avg: Math.round(avgWith * 100) / 100
      },
      withoutElitism: {
        best: Math.min(...withoutElitismPenalties),
        worst: Math.max(...withoutElitismPenalties),
        avg: Math.round(avgWithout * 100) / 100
      }
    });
  };

  useEffect(() => {
    handleRunGA();
  }, [useElitism, useRepair]);

  const bestSchedule: SlotAssignment[] = gaResult?.bestIndividual.chromosome || [];
  const penaltyDetails = gaResult?.bestIndividual.details;

  return (
    <div className="space-y-6">
      {/* Top Config & Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-lg border-b border-slate-700 pb-2">
            <Building2 className="w-5 h-5" />
            <span>Configuración del Horario</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-xs font-semibold text-slate-300">Estrategia de Elitismo (Count=2)</span>
              <button
                onClick={() => setUseElitism(!useElitism)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  useElitism ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {useElitism ? 'ACTIVADO' : 'DESACTIVADO'}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-xs font-semibold text-slate-300">Reparación vs Penalización</span>
              <button
                onClick={() => setUseRepair(!useRepair)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  useRepair ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {useRepair ? 'REPARAR' : 'PENALIZAR'}
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Tamaño de Población: {popSize}</label>
              <input
                type="range"
                min="20"
                max="150"
                step="10"
                value={popSize}
                onChange={e => setPopSize(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunGA}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Horario Optimizado</span>
            </button>

            <button
              onClick={handleCompareElitism}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center space-x-2 transition"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparar Con vs Sin Elitismo</span>
            </button>
          </div>
        </div>

        {/* Diagnosis & Penalty Breakdown */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <span className="text-slate-200 font-semibold text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
              Estado del Horario Generado
            </span>
            {penaltyDetails?.hardViolationsCount === 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Horario 100% Válido (0 Restricciones Duras Violadas)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                <AlertOctagon className="w-4 h-4 mr-1.5" /> {penaltyDetails?.hardViolationsCount} Conflictos Duros
              </span>
            )}
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Traslapes</span>
              <span className={`text-base font-mono font-bold ${penaltyDetails?.details?.collisions > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {penaltyDetails?.details?.collisions || 0} pts
              </span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sobrecupo</span>
              <span className={`text-base font-mono font-bold ${penaltyDetails?.details?.overcapacity > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {penaltyDetails?.details?.overcapacity || 0} pts
              </span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Software Faltante</span>
              <span className={`text-base font-mono font-bold ${penaltyDetails?.details?.missingSoftware > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {penaltyDetails?.details?.missingSoftware || 0} pts
              </span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Franjas Bloqueadas</span>
              <span className={`text-base font-mono font-bold ${penaltyDetails?.details?.blockedSlots > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {penaltyDetails?.details?.blockedSlots || 0} pts
              </span>
            </div>
          </div>

          {/* Elitism Comparison Results (If triggered) */}
          {elitismComparison && (
            <div className="bg-slate-900 border border-indigo-500/40 p-3.5 rounded-lg text-xs space-y-2">
              <p className="font-semibold text-indigo-300">Resultado del Experimento (10 Corridas):</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-emerald-400">CON Elitismo (Elitist):</span>
                  <p className="text-slate-300">Promedio Penalización: <b>{elitismComparison.withElitism.avg}</b> (Mejor: {elitismComparison.withElitism.best})</p>
                </div>
                <div>
                  <span className="font-bold text-rose-400">SIN Elitismo (Non-Elitist):</span>
                  <p className="text-slate-300">Promedio Penalización: <b>{elitismComparison.withoutElitism.avg}</b> (Mejor: {elitismComparison.withoutElitism.best})</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timetable Grid View */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2 flex items-center justify-between">
          <span>Matriz de Horarios Resultante (Salas de Cómputo vs Franjas Horarias)</span>
          <span className="text-xs text-slate-400">8 Cursos Asignados</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-700 min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-slate-300 text-xs uppercase font-semibold">
                <th className="p-3 border border-slate-700 w-36">Franja Horaria</th>
                {DEFAULT_LABS.map(lab => (
                  <th key={lab.id} className="p-3 border border-slate-700">
                    <div>{lab.name}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Cap: {lab.capacity} PCs | {lab.installedSoftware.slice(0, 3).join(', ')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot.id} className="border-b border-slate-700 hover:bg-slate-750">
                  <td className="p-3 border border-slate-700 bg-slate-900/60 font-mono text-xs text-indigo-300 font-medium">
                    {slot.name}
                  </td>
                  {DEFAULT_LABS.map((lab, labIdx) => {
                    // Buscar cursos asignados a esta sala y franja
                    const assignedCourseIndices: number[] = [];
                    bestSchedule.forEach((assign, courseIdx) => {
                      if (assign.labId === labIdx && assign.slotId === slotIdx) {
                        assignedCourseIndices.push(courseIdx);
                      }
                    });

                    const isCollision = assignedCourseIndices.length > 1;

                    return (
                      <td
                        key={lab.id}
                        className={`p-2 border border-slate-700 min-h-[90px] vertical-top ${
                          isCollision ? 'bg-rose-950/40' : assignedCourseIndices.length > 0 ? 'bg-indigo-950/30' : ''
                        }`}
                      >
                        {assignedCourseIndices.length === 0 ? (
                          <span className="text-[11px] text-slate-600 italic">--- Vacío ---</span>
                        ) : (
                          <div className="space-y-1.5">
                            {assignedCourseIndices.map(cIdx => {
                              const course = DEFAULT_COURSES[cIdx];
                              const hasOvercap = course.students > lab.capacity;
                              const missingSoft = course.reqSoftware.filter(s => !lab.installedSoftware.includes(s));

                              return (
                                <div
                                  key={cIdx}
                                  className={`p-2 rounded border text-xs shadow-sm ${
                                    hasOvercap || missingSoft.length > 0 || isCollision
                                      ? 'bg-rose-900/80 border-rose-600 text-rose-100'
                                      : 'bg-slate-900 border-indigo-500/50 text-slate-200'
                                  }`}
                                >
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{course.code}</span>
                                    <span className="text-[10px] text-slate-400">{course.students} est.</span>
                                  </div>
                                  <div className="text-[11px] truncate text-indigo-300 font-medium">{course.name}</div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {course.reqSoftware.map((req, rIdx) => (
                                      <span
                                        key={rIdx}
                                        className={`text-[9px] px-1 py-0.5 rounded ${
                                          lab.installedSoftware.includes(req)
                                            ? 'bg-slate-800 text-slate-300'
                                            : 'bg-rose-950 text-rose-300 font-bold'
                                        }`}
                                      >
                                        {req}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
