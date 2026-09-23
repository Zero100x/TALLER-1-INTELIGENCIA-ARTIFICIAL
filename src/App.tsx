import React, { useState } from 'react';
import { NQueensView } from './views/NQueensView';
import { TSPView } from './views/TSPView';
import { CourseView } from './views/CourseView';
import { KnapsackView } from './views/KnapsackView';
import { BenchmarkView } from './views/BenchmarkView';
import { ReportView } from './views/ReportView';
import { Dna, Crown, MapPin, Building2, Package, BarChart3, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nqueens' | 'tsp' | 'course' | 'knapsack' | 'benchmark' | 'report'>('nqueens');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navigation Bar */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <Dna className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
                  Taller 1: Algoritmos Genéticos
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">Inteligencia Artificial</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('nqueens')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'nqueens'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>N-Reinas</span>
              </button>

              <button
                onClick={() => setActiveTab('tsp')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'tsp'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>TSP Agente</span>
              </button>

              <button
                onClick={() => setActiveTab('course')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'course'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Cursos & Salas</span>
              </button>

              <button
                onClick={() => setActiveTab('knapsack')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'knapsack'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Mochila</span>
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'benchmark'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Benchmark</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'report'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Informe Teórico</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden overflow-x-auto px-2 py-2 border-t border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('nqueens')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'nqueens' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            👑 N-Reinas
          </button>
          <button
            onClick={() => setActiveTab('tsp')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'tsp' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            🗺️ TSP
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'course' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            🏫 Cursos
          </button>
          <button
            onClick={() => setActiveTab('knapsack')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'knapsack' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            🎒 Mochila
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'benchmark' ? 'bg-violet-600 text-white' : 'text-slate-400'
            }`}
          >
            📊 Benchmark
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'report' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            📚 Informe
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {activeTab === 'nqueens' && <NQueensView />}
        {activeTab === 'tsp' && <TSPView />}
        {activeTab === 'course' && <CourseView />}
        {activeTab === 'knapsack' && <KnapsackView />}
        {activeTab === 'benchmark' && <BenchmarkView />}
        {activeTab === 'report' && <ReportView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <p>Taller 1 - Algoritmos Genéticos y Evolutivos | Inteligencia Artificial</p>
      </footer>
    </div>
  );
};
