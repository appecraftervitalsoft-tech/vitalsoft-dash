/**
 * Fitness Calculations & Barbell Plate Mathematics
 */

/**
 * Calculate 1-Rep Max using standard Epley equation
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  // Epley formula: w * (1 + r / 30)
  const epley = weightKg * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
}

/**
 * Calculate training percentages based on 1RM
 */
export function getTrainingPercentages(oneRepMaxKg: number) {
  const table = [
    { percent: 100, reps: '1 rep', intensity: 'Máximo Absoluto' },
    { percent: 95, reps: '2 reps', intensity: 'Fuerza Pico' },
    { percent: 90, reps: '3-4 reps', intensity: 'Fuerza Máxima' },
    { percent: 85, reps: '5-6 reps', intensity: 'Fuerza / Potencia' },
    { percent: 80, reps: '7-8 reps', intensity: 'Hipertrofia Pesada' },
    { percent: 75, reps: '9-10 reps', intensity: 'Hipertrofia Media' },
    { percent: 70, reps: '11-12 reps', intensity: 'Hipertrofia Metabólica' },
    { percent: 65, reps: '13-15 reps', intensity: 'Resistencia Muscular' },
    { percent: 60, reps: '15-20 reps', intensity: 'Acondicionamiento / Descarga' },
  ];

  return table.map((item) => ({
    ...item,
    weightKg: Math.round(((oneRepMaxKg * item.percent) / 100) * 2) / 2, // round to nearest 0.5kg
  }));
}

/**
 * Plate breakdown for olympic barbell loading (per side)
 */
export interface PlateCalculationResult {
  weightPerSideKg: number;
  platesPerSide: { plateKg: number; count: number; colorHex: string }[];
  exactMatch: boolean;
  remainderKg: number;
}

export const OLYMPIC_PLATES = [
  { weight: 25, color: '#dc2626' }, // Red
  { weight: 20, color: '#2563eb' }, // Blue
  { weight: 15, color: '#eab308' }, // Yellow
  { weight: 10, color: '#16a34a' }, // Green
  { weight: 5, color: '#ffffff' }, // White
  { weight: 2.5, color: '#475569' }, // Dark Slate / Metal
  { weight: 1.25, color: '#94a3b8' }, // Light Slate
];

export function calculateBarbellPlates(
  totalWeightKg: number,
  barWeightKg = 20,
  availablePlates = OLYMPIC_PLATES
): PlateCalculationResult {
  if (totalWeightKg < barWeightKg) {
    return {
      weightPerSideKg: 0,
      platesPerSide: [],
      exactMatch: totalWeightKg === barWeightKg,
      remainderKg: 0,
    };
  }

  const weightNeeded = totalWeightKg - barWeightKg;
  let sideWeightNeeded = weightNeeded / 2;
  const initialSideWeight = sideWeightNeeded;

  const platesPerSide: { plateKg: number; count: number; colorHex: string }[] = [];

  for (const plate of availablePlates) {
    if (sideWeightNeeded >= plate.weight) {
      const count = Math.floor(sideWeightNeeded / plate.weight);
      if (count > 0) {
        platesPerSide.push({
          plateKg: plate.weight,
          count,
          colorHex: plate.color,
        });
        sideWeightNeeded = Math.round((sideWeightNeeded - count * plate.weight) * 100) / 100;
      }
    }
  }

  return {
    weightPerSideKg: initialSideWeight,
    platesPerSide,
    exactMatch: sideWeightNeeded === 0,
    remainderKg: sideWeightNeeded * 2,
  };
}

/**
 * Format elapsed seconds to mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
