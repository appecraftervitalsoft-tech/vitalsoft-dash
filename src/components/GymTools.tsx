import React, { useState } from 'react';
import {
  calculateBarbellPlates,
  calculate1RM,
  getTrainingPercentages,
  OLYMPIC_PLATES,
} from '../utils/calculator';
import { Dumbbell, Target, Layers, ArrowRight } from 'lucide-react';

export const GymTools: React.FC = () => {
  // Plate calculator state
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barWeight, setBarWeight] = useState<number>(20);

  // 1RM calculator state
  const [calcWeight, setCalcWeight] = useState<number>(90);
  const [calcReps, setCalcReps] = useState<number>(6);

  const plateResult = calculateBarbellPlates(targetWeight, barWeight);
  const estimated1RM = calculate1RM(calcWeight, calcReps);
  const percentageTable = getTrainingPercentages(estimated1RM);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      <div className="space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
          Herramientas del Gimnasio
        </h1>
        <p className="text-sm text-neutral-400">
          Calculadoras de precisión para cargar barras olímpicas y periodizar cargas de entrenamiento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Tool 1: Barbell Plate Calculator */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Calculadora de Discos de Barra</h2>
              <p className="text-xs text-neutral-400">Distribución exacta de discos por cada lado</p>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-500 uppercase block mb-2">
              Pesos rápidos habituales:
            </span>
            <div className="flex flex-wrap gap-2">
              {[60, 80, 100, 110, 120, 140, 160, 180].map((w) => (
                <button
                  key={w}
                  onClick={() => setTargetWeight(w)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    targetWeight === w
                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Peso Total a Cargar (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="2.5"
                  min={barWeight}
                  value={Number.isNaN(targetWeight) ? '' : targetWeight}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || barWeight)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">
                  KG
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Peso de la Barra
              </label>
              <select
                value={barWeight}
                onChange={(e) => setBarWeight(parseFloat(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="20">Barra Olímpica Estándar (20 kg)</option>
                <option value="15">Barra Técnica / Femenina (15 kg)</option>
                <option value="10">Barra Corta / Z (10 kg)</option>
              </select>
            </div>
          </div>

          {/* Visual Barbell Representation */}
          <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                Peso por lado: <strong className="text-white font-mono text-sm">{plateResult.weightPerSideKg} kg</strong>
              </span>
              <span className="text-neutral-500">
                Barra: {barWeight} kg
              </span>
            </div>

            {/* Visual Sleeve */}
            <div className="py-6 flex items-center justify-center">
              <div className="flex items-center gap-1 overflow-x-auto py-2 px-4 max-w-full">
                {/* Bar center collar */}
                <div className="w-8 h-10 bg-neutral-700 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-neutral-400 border border-neutral-600 shrink-0">
                  COLLAR
                </div>

                {/* Plates Loaded */}
                {plateResult.platesPerSide.length > 0 ? (
                  plateResult.platesPerSide.map((group, gIdx) => {
                    return Array.from({ length: group.count }).map((_, pIdx) => {
                      // Adjust height based on plate size
                      let heightClass = 'h-24';
                      if (group.plateKg === 25) heightClass = 'h-28';
                      if (group.plateKg === 20) heightClass = 'h-24';
                      if (group.plateKg === 15) heightClass = 'h-20';
                      if (group.plateKg === 10) heightClass = 'h-16';
                      if (group.plateKg === 5) heightClass = 'h-12';
                      if (group.plateKg === 2.5) heightClass = 'h-10';
                      if (group.plateKg === 1.25) heightClass = 'h-8';

                      return (
                        <div
                          key={`${gIdx}-${pIdx}`}
                          className={`w-6 sm:w-7 ${heightClass} rounded flex flex-col items-center justify-center text-[10px] font-mono font-bold text-neutral-950 shadow-md shrink-0 border border-black/30 transition-all`}
                          style={{ backgroundColor: group.colorHex }}
                          title={`Disco ${group.plateKg} kg`}
                        >
                          <span className="rotate-90 whitespace-nowrap">{group.plateKg}</span>
                        </div>
                      );
                    });
                  })
                ) : (
                  <div className="text-xs text-neutral-500 italic py-4">
                    Barra vacía ({barWeight} kg)
                  </div>
                )}

                {/* Sleeve tip */}
                <div className="w-12 h-6 bg-neutral-600 rounded-r-md border border-neutral-500 shrink-0" />
              </div>
            </div>

            {/* Breakdown text */}
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 block mb-2">
                Coloca en CADA LADO de la barra:
              </span>
              {plateResult.platesPerSide.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {plateResult.platesPerSide.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-neutral-900 rounded-xl border border-neutral-800 font-mono"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-black/20"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span className="text-white font-bold">{item.count}x</span>
                      <span className="text-neutral-300">disco de {item.plateKg} kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">Sin discos adicionales por lado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tool 2: 1-Rep Max (1RM) & Percentages */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Calculadora 1RM & Porcentajes</h2>
              <p className="text-xs text-neutral-400">Fórmula de Epley validada para programación de cargas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Peso Levantado (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={Number.isNaN(calcWeight) ? '' : calcWeight}
                onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Repeticiones Realizadas
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={Number.isNaN(calcReps) ? '' : calcReps}
                onChange={(e) => setCalcReps(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Highlight Result Card */}
          <div className="bg-gradient-to-br from-amber-500/20 via-neutral-950 to-neutral-950 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                Tu Máximo Teórico Estimado
              </span>
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-white font-mono tabular-nums">
                {estimated1RM} <span className="text-lg font-normal text-amber-400">kg</span>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400 max-w-[140px]">
              Calculado a partir de {calcWeight}kg × {calcReps} reps
            </div>
          </div>

          {/* Percentage Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Tabla de Porcentajes de Entrenamiento
            </h4>
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
              {percentageTable.map((row) => (
                <div
                  key={row.percent}
                  className="px-4 py-2.5 flex items-center justify-between text-xs font-mono tabular-nums hover:bg-neutral-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-12 font-bold ${
                        row.percent >= 90
                          ? 'text-red-400'
                          : row.percent >= 80
                          ? 'text-amber-400'
                          : 'text-neutral-300'
                      }`}
                    >
                      {row.percent}%
                    </span>
                    <span className="text-neutral-400 font-sans">{row.intensity}</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="text-neutral-500 hidden sm:inline font-sans">
                      {row.reps}
                    </span>
                    <span className="text-white font-bold text-sm">
                      {row.weightKg} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
