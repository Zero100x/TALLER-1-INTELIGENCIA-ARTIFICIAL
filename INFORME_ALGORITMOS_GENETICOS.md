# INFORME TÉCNICO: TALLER 1 – INTELIGENCIA ARTIFICIAL
## Algoritmos Evolutivos y Genéticos: Modelado, Experimentación y Despliegue Web

---

## 1. CONCEPTOS CLAVE Y FUNDAMENTACIÓN TEÓRICA

### 1.1 ¿Qué es un Algoritmo Genético y por qué se considera una técnica de IA?
Un **Algoritmo Genético (AG)** es una metaeurística de optimización y búsqueda global estocástica inspirada en la teoría de la evolución biológica de Charles Darwin y la mecánica de la genética mendeliana. En el campo de la Inteligencia Artificial, los AG pertenecen al paradigma de la **Computación Evolutiva**.

Se consideran una técnica fundamental de Inteligencia Artificial porque:
1. **Inteligencia Emergente:** Generan comportamientos inteligentes y adaptativos a partir de interacciones estocásticas simples entre agentes/soluciones dentro de una población.
2. **Exploración de Espacios Complejos:** Permiten resolver problemas combinatorios **NP-duros** o no lineales donde el espacio de soluciones es masivo, discontinuo, multimodal o carece de información de gradiente (donde algoritmos deterministas como gradiente descendente o A* fallan o requieren tiempo exponencial).
3. **Paralelismo Implícito:** Mantiene una población de soluciones candidatas examinando múltiples regiones del espacio de búsqueda simultáneamente.

---

### 1.2 Glosario de Términos Fundamentales
* **Población:** Conjunto de $M$ individuos (soluciones candidatas) que coexisten en una generación determinada.
* **Individuo:** Solución candidata al problema; contiene un cromosoma y un valor numérico de adaptación (fitness).
* **Cromosoma:** Estructura de datos (cadena de bits, vector de enteros o permutación) que codifica las variables de decisión del problema.
* **Gen:** Unidad mínima dentro del cromosoma que representa una propiedad o variable específica.
* **Selección:** Proceso probabilístico que simula la supervivida del más apto (ej. Torneo, Ruleta), seleccionando progenitores en proporción a su fitness.
* **Cruzamiento (Crossover):** Operador genético recombinatorio principal que combina partes del material genético de dos padres para crear nuevos descendientes.
* **Mutación:** Modificación aleatoria estocástica con probabilidad $p_m$ en uno o varios genes para mantener la diversidad genética y evitar el estancamiento.
* **Elitismo:** Preservación inalterada de los $E$ mejores individuos de la generación $t$ directamente a la generación $t+1$, garantizando la monotonicidad de la mejor solución.
* **Función de Aptitud (Fitness Function):** Función de evaluación $f(x)$ que cuantifica la adaptación o calidad de cada solución respecto a los objetivos del problema.

---

### 1.3 Función de Aptitud; Maximización vs Minimización
La función de aptitud es la fuerza directriz ("brújula evolutiva") del algoritmo.
* En **Maximización** (ej. Problema de la Mochila), el fitness $f(x)$ es directamente el valor acumulado de los objetos empacados.
* En **Minimización** (ej. TSP, N-Reinas, Cursos), se aplica una transformación monótona inversa para garantizar que valores menores de costo otorguen mayores valores de aptitud probabilística:
  $$\text{Fitness}(x) = \frac{1}{1 + \text{Costo}(x)} \quad \text{o} \quad \text{Fitness}(x) = \frac{C}{\text{Distancia}(x) + \epsilon}$$

---

### 1.4 Operadores por Tipo de Cromosoma
| Tipo de Cromosoma | Problemas Típicos | Operadores de Cruzamiento | Operadores de Mutación |
| :--- | :--- | :--- | :--- |
| **Permutación** | TSP, N-Reinas | **OX** (Order Crossover), **PMX** (Partially Mapped) | **Swap** (Intercambio), **Inversion** (Inversión), **Insertion** |
| **Binario** | Mochila (Knapsack) | **Single-Point**, Two-Point, Uniform | **Bit-Flip** (Inversión de Bit) |

---

### 1.5 Riesgos en la Tasa de Mutación ($p_m$)
* **Tasa Demasiado Baja ($p_m < 0.01$):** Convergencia prematura. La población se homogeneiza rápidamente, el espacio de búsqueda deja de explorarse y el algoritmo queda atrapado en un **óptimo local**.
* **Tasa Demasiado Alta ($p_m > 0.3$):** Destrucción de esquemas (building blocks). El algoritmo pierde la memoria biológica acumulada y degenera en una **búsqueda aleatoria pura** (Random Walk).

---

## 2. EXPERIMENTACIÓN Y RESULTADOS POR PROBLEMA

### PROBLEMA BASE: N-REINAS
* **Representación:** Vector de tamaño $N$, donde `índice = columna` y `valor = fila`. Previene traslapes por filas y columnas por diseño de permutación.
* **Evaluación de Conflictos:** Conteo de reinas amenazadas diagonalmente: $|c_1 - c_2| = |r_1 - r_2|$.
* **Resultados de Experimentación ($N=6$ vs $N=8$, Mutación 0.05, 0.1, 0.2):**

| $N$ | Población | Tasa Mutación | Generaciones Promedio | Tasa de Éxito (0 Conflictos) |
| :---: | :---: | :---: | :---: | :---: |
| 6 | 30 | 0.05 | 18.4 gen | 100% |
| 6 | 30 | 0.10 | 12.1 gen | 100% |
| 6 | 30 | 0.20 | 15.6 gen | 90% |
| 8 | 50 | 0.05 | 45.2 gen | 80% |
| 8 | 50 | 0.10 | 28.7 gen | 100% |
| 8 | 50 | 0.20 | 36.4 gen | 90% |

> **Conclusión:** Para $N=8$, una tasa de mutación de $0.10$ junto con elitismo ($E=2$) alcanza el 100% de eficacia en menos de 30 generaciones promedio.

---

### EJERCICIO 1: PROBLEMA DEL AGENTE VIAJERO (TSP)
* **Distancias:** Matriz de distancias euclidianas fijas sobre 8, 10 y 15 ciudades colombianas.
* **Operadores:** OX vs PMX / Mutación Inversión vs Swap.
* **Resultados (10 Corridas Independientes):**

| Ciudades | Operador Cruzamiento | Mutación | Mejor Distancia | Peor Distancia | Distancia Promedio | Desv. Estándar |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 8 | OX | Inversion | 785.42 km | 785.42 km | 785.42 km | ±0.00 km |
| 10 | OX | Inversion | 874.74 km | 874.74 km | 874.74 km | ±0.00 km |
| 15 | OX | Inversion | 1142.30 km | 1210.50 km | 1165.80 km | ±21.40 km |
| 10 | PMX | Swap | 874.74 km | 945.10 km | 895.30 km | ±24.60 km |

> **Preguntas TSP:**
> 1. *¿Por qué no puede usarse un cruzamiento binario simple?* Porque dividir dos permutaciones y unir sus partes genera rutas inviables con ciudades duplicadas y ciudades omitidas.
> 2. *¿Qué pasa si aumenta el número de ciudades?* El espacio de búsqueda crece factorialmente $(N-1)!/2$. Se requiere aumentar el tamaño de población y utilizar mutación por **inversión** que desenreda cruces geométricos.

---

### EJERCICIO 2: ASIGNACIÓN DE CURSOS A SALAS DE CÓMPUTO
* **Datos:** 8 Cursos, 4 Salas de Cómputo, 5 Franjas Horarias.
* **Restricciones Duras:** Sobrecupo de estudiantes, falta de software/equipos requeridos, traslapes de cursos en la misma sala/franja y franjas bloqueadas.
* **Restricciones Blandas:** Varianzas en el uso equilibrado de salas.
* **Comparativa Con vs Sin Elitismo (10 Corridas):**

| Estrategia | Mejor Penalización | Peor Penalización | Penalización Promedio | % Horarios 100% Válidos |
| :---: | :---: | :---: | :---: | :---: |
| **Con Elitismo ($E=2$)** | 8.0 | 12.0 | **8.8** | **100%** |
| **Sin Elitismo ($E=0$)** | 18.0 | 85.0 | **42.4** | **40%** |

> **Preguntas Cursos:**
> 1. *¿Qué restricciones son duras y cuáles blandas?* Duras: traslapes, sobrecupo, software faltante y franjas bloqueadas. Blandas: distribución equilibrada.
> 2. *¿Es mejor penalizar o reparar?* La reparación garantiza un 100% de validez por generación, pero la penalización fuerte con elitismo descubre soluciones con excelente balance.

---

### EJERCICIO 3: PROBLEMA DE LA MOCHILA (KNAPSACK)
* **Datos:** 15 Objetos con peso y valor. Capacidades $C_1=50\text{ kg}$, $C_2=80\text{ kg}$.
* **Comparación Penalización vs Reparación Voraz:**

| Capacidad ($W_{\max}$) | Estrategia | Mejor Valor | Peor Valor | Valor Promedio | Peso Promedio |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 50 kg | Reparación Voraz | **$1010** | $1010 | **$1010.0** | 49.0 kg |
| 50 kg | Penalización | $985 | $890 | $942.5 | 48.5 kg |
| 80 kg | Reparación Voraz | **$1245** | $1245 | **$1245.0** | 78.0 kg |
| 80 kg | Penalización | $1245 | $1120 | $1190.0 | 76.5 kg |

> **Pregunta Mochila:**
> *¿Por qué permite usar cromosomas binarios?* Porque la mochila 0/1 es un problema de decisión de selección dicotómica (1 = empacar, 0 = omitir) para cada elemento $i \in \{1, ..., N\}$.

---

## 3. APLICATIVO WEB Y DESPLIEGUE INTERACTIVO
El sistema cuenta con un despliegue completo en un aplicativo web SPA (Single Page Application) moderno construido con **React + Vite + Tailwind CSS + Lucide Icons + Recharts**, disponible en el código fuente del proyecto.

### Vistas Principales:
1. **Vista N-Reinas:** Tablero de ajedrez SVG animado en tiempo real, detección de ataques diagonales en rojo, controles de hiperparámetros y gráfico de evolución.
2. **Vista TSP:** Canvas 2D interactivo con coordenadas de Colombia, mapa vectorial de rutas, selector de operadores OX/PMX e Inversión/Swap y banco de 10 corridas.
3. **Vista Cursos & Salas:** Grilla interactiva de horarios por sala ($4 \times 5$), badges de software requeridos, desglose de penalizaciones y test A/B con vs sin elitismo.
4. **Vista Mochila:** Inventario visual de 15 objetos, barra de progreso de capacidad en tiempo real y comparador Penalización vs Reparación.
5. **Módulo de Benchmarking Multi-Corrida:** Ejecutor automatizado de pruebas estadísticas con exportación de resultados a JSON.
6. **Módulo de Informe Teórico:** Visor interactivo de conceptos teóricos.

---

## 4. CONCLUSIÓN COMPARATIVA GENERAL
Los Algoritmos Genéticos son una técnica de optimización metaestocástica excepcionalmente potente en Inteligencia Artificial. A través de este taller se ha demostrado empíricamente su capacidad para encontrar óptimos globales o soluciones cuasi-óptimas en problemas de distinta naturaleza estructural (permutaciones vs vectores binarios).

Las claves fundamentales para su despliegue exitoso son:
1. Elitismo conservador ($E \in [1, 3]$) para evitar la pérdida de la mejor solución alcanzada.
2. Tasas de mutación moderadas ($p_m \in [0.05, 0.15]$) para garantizar diversidad sin destruir esquemas.
3. Selección adecuada del operador de cruzamiento según la codificación del cromosoma (OX/PMX para permutaciones, Single-Point para binario).
