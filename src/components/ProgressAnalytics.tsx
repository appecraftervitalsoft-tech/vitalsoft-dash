import React, { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
  Dumbbell,
  Award,
  ChevronDown,
  ChevronUp,
  Flame,
  Search,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { calculate1RM } from '../utils/calculator';

export const ProgressAnalytics: React.FC = () => {
  const { currentClient, prs, completedWorkouts } = useWorkout();

  // Filter completed workouts for current client
  const clientWorkouts = completedWorkouts.filter(
    (w) => w.clientId === currentClient.id
  );

  // Collect all unique exercises that have history
  const recordedExerciseNames = Array.from(
    new Set(
      clientWorkouts.flatMap((w) => w.exercises.map((e) => e.name))
    )
  );

  const defaultExercise = recordedExerciseNames[0] || 'Press de Banca Plano';
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState<string>(defaultExercise);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Build progression datapoints for selected exercise
  const exerciseDataPoints: {
    date: string;
    maxWeight: number;
    reps: number;
    estimated1RM: number;
    workoutTitle: string;
  }[] = [];

  // Sort chronological
  const chronological = [...clientWorkouts].reverse();

  chronological.forEach((w) => {
    const match = w.exercises.find(
      (e) => e.name.toLowerCase() === selectedExerciseForChart.toLowerCase()
    );
    if (match && match.sets.length > 0) {
      // Find top set in this session
      let best1RM = 0;
      let topWeight = 0;
      let topReps = 0;

      match.sets.forEach((s) => {
        const est1RM = calculate1RM(s.weightKg, s.reps);
        if (est1RM > best1RM) {
          best1RM = est1RM;
          topWeight = s.weightKg;
          topReps = s.reps;
        }
      });

      if (topWeight > 0) {
        exerciseDataPoints.push({
          date: w.date,
          maxWeight: topWeight,
          reps: topReps,
          estimated1RM: best1RM,
          workoutTitle: w.routineTitle,
        });
      }
    }
  });

  // Calculate high-level metrics
  const totalVolumeAllTime = clientWorkouts.reduce((acc, w) => acc + w.totalVolumeKg, 0);
  const totalWorkoutsCount = clientWorkouts.length;
  const totalPrsAllTime = prs.length;

  // Filter workout history by search
  const filteredWorkouts = clientWorkouts.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      w.routineTitle.toLowerCase().includes(term) ||
      w.exercises.some((e) => e.name.toLowerCase().includes(term))
    );
  });

  // Chart coordinate calculations
  const max1RM = exerciseDataPoints.length > 0
    ? Math.max(...exerciseDataPoints.map((p) => p.estimated1RM)) * 1.1
    : 100;
  const min1RM = exerciseDataPoints.length > 0
    ? Math.max(0, Math.min(...exerciseDataPoints.map((p) => p.estimated1RM)) * 0.8)
    : 0;

  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = (index: number, value: number) => {
    const x =
      exerciseDataPoints.length === 1
        ? chartWidth / 2
        : paddingX +
          (index / (exerciseDataPoints.length - 1)) * (chartWidth - paddingX * 2);
    const range = max1RM - min1RM || 1;
    const y =
      chartHeight -
      paddingY -
      ((value - min1RM) / range) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const polylinePoints = exerciseDataPoints
    .map((p, idx) => {
      const { x, y } = getCoordinates(idx, p.estimated1RM);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Sesiones Completadas</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-white font-mono tabular-nums">
            {totalWorkoutsCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Registradas en IronTrack</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Volumen Total Levantado</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-amber-400 font-mono tabular-nums">
            {(totalVolumeAllTime / 1000).toFixed(1)} <span className="text-sm font-normal text-neutral-400">toneladas</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Acumulado en series efectivas</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Récords Personales (PRs)</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-yellow-400 font-mono tabular-nums">
            {totalPrsAllTime}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">En ejercicios principales</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Consistencia</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-display font-bold text-emerald-400 font-mono tabular-nums">
            {clientWorkouts.length > 0 ? '100%' : '0%'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Plan semanal completado</p>
        </div>
      </div>

      {/* PR Showcase Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Cuadro de Honor de Récords Personales</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Marcas máximas registradas y 1RM estimado alcanzado por {currentClient.name}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prs.map((pr) => (
            <div
              key={pr.exerciseId}
              className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {pr.exerciseName}
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    Logrado el {pr.achievedAt}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-baseline justify-between font-mono tabular-nums">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Carga Máxima</span>
                  <span className="text-xl font-extrabold text-white">
                    {pr.maxWeightKg} kg <span className="text-xs text-neutral-400 font-normal">× {pr.maxWeightReps} reps</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block uppercase">1RM Est.</span>
                  <span className="text-sm font-bold text-amber-400">
                    {pr.maxEstimated1RM} kg
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive 1RM Progression Chart */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Análisis de Sobrecarga Progresiva
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Evolución de Fuerza & 1RM
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Curva de rendimiento calculada en base a las cargas y repeticiones registradas sesión tras sesión.
            </p>
          </div>

          {/* Exercise Selector */}
          <div className="shrink-0">
            <select
              value={selectedExerciseForChart}
              onChange={(e) => setSelectedExerciseForChart(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              {recordedExerciseNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SVG Chart */}
        {exerciseDataPoints.length > 0 ? (
          <div className="bg-neutral-950 rounded-2xl p-4 sm:p-6 border border-neutral-800">
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 min-w-[500px] overflow-visible"
              >
                {/* Grid horizontal guidelines */}
                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const val = min1RM + (max1RM - min1RM) * ratio;
                  const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#262626"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        fill="#737373"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {Math.round(val)}kg
                      </text>
                    </g>
                  );
                })}

                {/* Line path */}
                {exerciseDataPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Data points */}
                {exerciseDataPoints.map((point, idx) => {
                  const { x, y } = getCoordinates(idx, point.estimated1RM);
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#f59e0b"
                        stroke="#0a0a0a"
                        strokeWidth="2"
                        className="group-hover:r-7 transition-all"
                      />
                      {/* Label on top of point */}
                      <text
                        x={x}
                        y={y - 12}
                        fill="#e5e5e5"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {point.estimated1RM} kg
                      </text>
                      {/* Date label at bottom */}
                      <text
                        x={x}
                        y={chartHeight - 8}
                        fill="#737373"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {point.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 mt-4 pt-3 border-t border-neutral-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                1RM Estimado en cada sesión
              </span>
              <span>
                Última marca: <strong className="text-white">{exerciseDataPoints[exerciseDataPoints.length - 1]?.maxWeight} kg × {exerciseDataPoints[exerciseDataPoints.length - 1]?.reps} reps</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950 rounded-2xl p-8 text-center text-neutral-400 text-sm border border-neutral-800">
            Aún no hay registros de este ejercicio para generar la gráfica. ¡Realiza una sesión en vivo para comenzar!
          </div>
        )}
      </section>

      {/* Past Completed Workouts History */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Historial Detallado de Sesiones</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Revisa tus entrenamientos previos, series levantadas y sensaciones registradas.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por rutina o ejercicio..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => {
              const isExpanded = expandedWorkoutId === workout.id;

              return (
                <div
                  key={workout.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-neutral-400">{workout.date}</span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {workout.durationMinutes} min
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="capitalize text-amber-400 font-semibold">
                          Sensación: {workout.feeling}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {workout.routineTitle}
                      </h3>
                      {workout.notes && (
                        <p className="text-xs text-neutral-400 italic">
                          "{workout.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 text-xs font-mono tabular-nums shrink-0">
                      <div>
                        <span className="text-neutral-500 text-[10px] block uppercase">Volumen</span>
                        <span className="font-bold text-amber-400 text-sm">
                          {workout.totalVolumeKg} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px] block uppercase">Series</span>
                        <span className="font-bold text-white text-sm">
                          {workout.totalSetsCompleted}
                        </span>
                      </div>
                      {workout.prsAchieved > 0 && (
                        <div className="text-yellow-400 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{workout.prsAchieved} PR</span>
                        </div>
                      )}
                      <div className="text-neutral-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded exercise details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-neutral-800 bg-neutral-950/40">
                      <div className="space-y-4">
                        {workout.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-neutral-800 text-[10px] flex items-center justify-center font-mono">
                                  {exIdx + 1}
                                </span>
                                {ex.name}
                              </h5>
                              <span className="text-[10px] text-neutral-500 uppercase">
                                {ex.muscleGroup}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((set, setIdx) => (
                                <div
                                  key={setIdx}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums border ${
                                    set.isPR
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                      : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                  }`}
                                >
                                  <span className="text-neutral-500 text-[10px] mr-1">
                                    S{setIdx + 1}:
                                  </span>
                                  <strong>{set.weightKg}kg</strong> × {set.reps}
                                  {set.rpe ? ` @RPE${set.rpe}` : ''}
                                  {set.isPR && ' 🏆'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center text-neutral-400 text-sm">
              No se encontraron entrenamientos con ese criterio.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
