import React from 'react';
import { BookOpen, HelpCircle, FileText, ShieldCheck } from 'lucide-react';

export const ReportView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 border border-slate-700 rounded-xl p-6 shadow-xl text-slate-100">
        <div className="flex items-center space-x-3 text-indigo-400 font-bold text-xl mb-2">
          <BookOpen className="w-7 h-7" />
          <h1>Informe Técnico & Respuestas a Conceptos Clave (Taller 1)</h1>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Fundamentación teórica, análisis de representación de cromosomas, funciones de aptitud, operadores estocásticos
          y conclusiones comparativas sobre los Algoritmos Genéticos como técnica de Inteligencia Artificial para la resolución
          de problemas de búsqueda y optimización combinatoria.
        </p>
      </div>

      {/* Conceptos Clave (Preguntas 1 a 5) */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-indigo-300 border-b border-slate-700 pb-3 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-indigo-400" />
          1. Conceptos Clave de Algoritmos Genéticos
        </h2>

        {/* Pregunta 1 */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-300 text-sm">
            1. ¿Qué es un Algoritmo Genético (AG) y por qué se considera una técnica de búsqueda/optimización dentro de la IA?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Un <b>Algoritmo Genético</b> es una heurística de búsqueda metaestocástica inspirada en los principios de la
            evolución biológica y la selección natural enunciada por Charles Darwin. Pertenece al campo de la <i>Computación Evolutiva</i> en IA.
            Se considera una técnica de optimización porque explora simultáneamente múltiples regiones de un espacio de búsqueda complejo (no lineal,
            discontinuo o NP-duro) guiado por una función de aptitud, utilizando mecanismos estocásticos como selección, cruzamiento y mutación. A diferencia
            de los algoritmos de búsqueda determinista (como A* o Dijkstra) o los métodos basados en gradiente, los AG no requieren que la función sea diferenciable ni continua,
            lo que permite encontrar soluciones cuasi-óptimas en espacios de dimensiones masivas.
          </p>
        </div>

        {/* Pregunta 2 */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-300 text-sm">
            2. Términos Fundamentales de un AG
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
            <li><b>Población:</b> Conjunto de individuos (soluciones candidatas) mantenidas simultáneamente en una generación determinada.</li>
            <li><b>Individuo:</b> Una solución concreta del problema que posee una representación genética (cromosoma) y una evaluación de calidad (fitness).</li>
            <li><b>Cromosoma:</b> Estructura de datos completa (vector binario, permutación o lista) que codifica la solución del problema.</li>
            <li><b>Gen:</b> Unidad básica del cromosoma que almacena el valor de una variable o parámetro específico del problema.</li>
            <li><b>Selección:</b> Proceso probabilístico que favorece la supervivencia y reproducción de los individuos con mayor aptitud (ej. Torneo, Ruleta).</li>
            <li><b>Cruzamiento (Crossover):</b> Operador recombinatorio principal que combina material genético de dos padres para producir descendencia.</li>
            <li><b>Mutación:</b> Alteración estocástica aleatoria en uno o varios genes para introducir diversidad y evitar la convergencia en óptimos locales.</li>
            <li><b>Elitismo:</b> Mecanismo que copia directamente los E mejores individuos de la generación actual a la siguiente sin modificar, asegurando que la calidad de la mejor solución nunca se degrade.</li>
            <li><b>Función de Aptitud (Fitness Function):</b> Función matemática que cuantifica el grado de adaptación de un individuo respecto a los objetivos del problema.</li>
          </ul>
        </div>

        {/* Pregunta 3 */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-300 text-sm">
            3. Importancia de la Función de Aptitud; Maximización vs Minimización
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            La función de aptitud es la <b>"brújula evolutiva"</b> del algoritmo. Un diseño defectuoso de la función de aptitud conducirá a una
            convergencia hacia soluciones indeseadas o engañosas. En problemas de <b>maximización</b> (como la Mochila), la aptitud es directamente
            el valor acumulado; en problemas de <b>minimización</b> (como la distancia en TSP o los conflictos en N-Reinas y Cursos), se aplica una
            transformación inversamente proporcional como f(x) = 1 / (1 + costo(x)) o f(x) = C / (distancia + ε), convirtiendo
            el problema de minimización en una escala de maximización donde mayor valor representa mayor aptitud probabilística.
          </p>
        </div>

        {/* Pregunta 4 */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-300 text-sm">
            4. Operadores de Cruzamiento y Mutación para Cromosomas de Permutación vs Binarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800 p-3 rounded border border-indigo-500/30">
              <h4 className="font-bold text-indigo-300 mb-1">Cromosomas de Permutación (TSP, N-Reinas)</h4>
              <p className="text-slate-300 mb-2"><b>Requisito:</b> No se permiten elementos duplicados ni faltantes.</p>
              <p><b>Cruzamiento:</b> OX (Order Crossover), PMX (Partially Mapped Crossover), Cycle Crossover.</p>
              <p className="mt-1"><b>Mutación:</b> Intercambio (Swap), Inversión de subsegmento (Inversion), Inserción (Insertion).</p>
            </div>
            <div className="bg-slate-800 p-3 rounded border border-emerald-500/30">
              <h4 className="font-bold text-emerald-300 mb-1">Cromosomas Binarios (Mochila)</h4>
              <p className="text-slate-300 mb-2"><b>Requisito:</b> Cada posición es independientemente 0 o 1.</p>
              <p><b>Cruzamiento:</b> Cruzamiento de un Solo Punto (Single-Point), De dos puntos, Uniforme (Uniform).</p>
              <p className="mt-1"><b>Mutación:</b> Inversión de bit (Bit-Flip mutation).</p>
            </div>
          </div>
        </div>

        {/* Pregunta 5 */}
        <div className="space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-700">
          <h3 className="font-bold text-amber-300 text-sm">
            5. Riesgos de una Tasa de Mutación Demasiado Baja o Demasiado Alta
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            - <b>Tasa Demasiado Baja (p_m &lt; 0.01):</b> La población pierde diversidad genética rápidamente. Todos los individuos se vuelven idénticos prematuramente y el algoritmo queda atrapado irreparablemente en un <i>óptimo local</i>.
            <br />
            - <b>Tasa Demasiado Alta (p_m &gt; 0.3):</b> El proceso evolutivo pierde su memoria acumulada y destruye los bloques de construcción (building blocks) adaptados. El algoritmo degenera en una <i>búsqueda aleatoria pura (random walk)</i> sin convergencia.
          </p>
        </div>
      </div>

      {/* Preguntas Específicas por Ejercicio */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-6">
        <h2 className="text-lg font-bold text-indigo-300 border-b border-slate-700 pb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-indigo-400" />
          2. Respuestas a Preguntas de los Ejercicios Prácticos
        </h2>

        {/* Ejercicio 1 TSP */}
        <div className="space-y-2 border-l-4 border-indigo-500 pl-4 py-1">
          <h3 className="font-bold text-slate-200 text-sm">
            Ejercicio 1 (TSP): ¿Por qué no puede usarse cruzamiento binario simple? ¿Qué pasa al aumentar ciudades? ¿Qué mutación es mejor?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            - <b>Cruzamiento simple:</b> En el TSP, un cromosoma representa un recorrido que debe visitar cada ciudad <i>exactamente una vez</i>. Si aplicamos un cruzamiento estándar de punto único (ej. cortar dos vectores permutados), la mezcla resultante producirá rutas inválidas con ciudades duplicadas y ciudades omitidas. Por ello son obligatorios operadores orientados a permutaciones como OX o PMX.
            <br />
            - <b>Aumento de ciudades:</b> El espacio de búsqueda crece factorialmente (N-1)! / 2. Para N=15, existen más de 43 mil millones de rutas posibles. Se requiere aumentar el tamaño de población y generaciones para mantener alta tasa de éxito.
            <br />
            - <b>Mejor mutación:</b> En las pruebas empíricas, la <b>Inversión (Inversion)</b> supera al Swap simple, ya que desenreda cruces en el plano 2D al invertir tramos completos de la ruta.
          </p>
        </div>

        {/* Ejercicio 2 Cursos */}
        <div className="space-y-2 border-l-4 border-amber-500 pl-4 py-1">
          <h3 className="font-bold text-slate-200 text-sm">
            Ejercicio 2 (Asignación de Cursos): Restricciones duras vs blandas; ¿Penalizar o Reparar?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            - <b>Restricciones Duras:</b> Traslapes de horarios en la misma sala, sobrecupo de estudiantes, falta de software/hardware esencial y franjas bloqueadas. Un horario con 1 sola restricción dura violada es <i>inválido e inaceptable en la realidad</i>.
            <br />
            - <b>Restricciones Blandas:</b> Balance en la distribución de uso de las salas de cómputo y preferencia de franjas horarias.
            <br />
            - <b>Penalizar vs Reparar:</b> La reparación directa garantiza que el 100% de la población sea siempre válida, acelerando la convergencia hacia el óptimo; sin embargo, requiere mayor costo computacional por generación. La penalización fuerte (ej. +100 puntos por traslape) permite mayor libertad de exploración y funciona muy bien cuando la tasa de mutación es moderada y hay elitismo.
          </p>
        </div>

        {/* Ejercicio 3 Mochila */}
        <div className="space-y-2 border-l-4 border-emerald-500 pl-4 py-1">
          <h3 className="font-bold text-slate-200 text-sm">
            Ejercicio 3 (Mochila Knapsack): ¿Por qué permite usar cromosomas binarios?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            El problema de la mochila 0/1 es por definición una <b>decisión de inclusión/exclusión</b> para cada elemento disponible i. Un vector binario donde x_i = 1 indica que el objeto i se empaca en la mochila y x_i = 0 indica que se deja fuera representa de manera exacta y completa todo el espacio de soluciones posibles de 2^N combinaciones, permitiendo el uso natural de cruzamiento de punto único y mutación de bit-flip.
          </p>
        </div>
      </div>

      {/* Conclusión Comparativa General */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-bold text-emerald-400 border-b border-slate-700 pb-3 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" />
          3. Conclusión Comparativa Final
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Los Algoritmos Genéticos han demostrado ser una herramienta de Inteligencia Artificial altamente robusta y versátil para resolver
          problemas de optimización combinatoria pertenecientes a diferentes clases de complejidad (N-Reinas, Agente Viajero NP-Duro, Programación de Horarios y Mochila 0/1).
          Su mayor fortaleza radica en su capacidad para balancear la <b>exploración global del espacio de soluciones</b> (mediante mutación y diversidad poblacional)
          con la <b>explotación de las mejores zonas encontradas</b> (mediante selección y elitismo). La clave del éxito práctico radica en elegir la representación de cromosoma adecuada (permutación vs binaria) y una función de aptitud rigurosa.
        </p>
      </div>
    </div>
  );
};
