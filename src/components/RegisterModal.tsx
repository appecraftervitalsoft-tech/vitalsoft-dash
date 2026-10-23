import React, { useState } from 'react';
import { X, UserPlus, Shield, Dumbbell, CheckCircle2 } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ClientProfile } from '../types/fitness';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'student' | 'coach';
  onStudentRegistered?: (student: ClientProfile) => void;
  onCoachRegistered?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'student',
  onStudentRegistered,
  onCoachRegistered,
}) => {
  const { addNewClient, addNewCoach, coaches } = useWorkout();
  const [activeTab, setActiveTab] = useState<'student' | 'coach'>(initialTab);

  // Student form state
  const [studentDni, setStudentDni] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGoal, setStudentGoal] = useState('Hipertrofia & Fuerza');
  const [studentLevel, setStudentLevel] = useState<ClientProfile['level']>('Intermedio');
  const [studentWeight, setStudentWeight] = useState('75');
  const [studentHeight, setStudentHeight] = useState('175');
  const [studentCoach, setStudentCoach] = useState(coaches[0]?.name || 'Prof. Marcos Valenzuela');
  const [studentNotes, setStudentNotes] = useState('');

  // Coach form state
  const [coachDni, setCoachDni] = useState('');
  const [coachName, setCoachName] = useState('');
  const [coachSpecialty, setCoachSpecialty] = useState('Entrenador de Sala & Musculación');
  const [coachPhone, setCoachPhone] = useState('');

  // Status & error messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanDni = studentDni.replace(/[.\s-]/g, '').trim();
    const cleanName = studentName.trim();

    if (!cleanDni) {
      setErrorMsg('Por favor escribe el número de DNI del alumno.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Por favor escribe el nombre completo del alumno.');
      return;
    }

    const created = addNewClient({
      dni: cleanDni,
      name: cleanName,
      goal: studentGoal.trim() || 'Fuerza & Acondicionamiento',
      level: studentLevel,
      bodyWeightKg: parseFloat(studentWeight) || 70,
      heightCm: parseFloat(studentHeight) || 170,
      coach: studentCoach,
      notesFromCoach: studentNotes.trim(),
    });

    setSuccessMsg(`¡Alumno ${cleanName} registrado con éxito! DNI: ${cleanDni}`);
    setTimeout(() => {
      setSuccessMsg('');
      onStudentRegistered?.(created);
      onClose();
    }, 1200);
  };

  const handleRegisterCoach = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanDni = coachDni.replace(/[.\s-]/g, '').trim();
    const cleanName = coachName.trim();

    if (!cleanDni) {
      setErrorMsg('Por favor escribe el número de DNI del profesor.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Por favor escribe el nombre completo del profesor.');
      return;
    }

    addNewCoach({
      dni: cleanDni,
      name: cleanName,
      specialty: coachSpecialty.trim() || 'Profesor de Sala',
      phone: coachPhone.trim(),
    });

    setSuccessMsg(`¡Profesor ${cleanName} registrado con éxito! DNI: ${cleanDni}`);
    setTimeout(() => {
      setSuccessMsg('');
      onCoachRegistered?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center space-y-1 mb-5">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wide uppercase">
            Alta en IronTrack
          </h2>
          <p className="text-xs text-neutral-400">
            Registra un nuevo socio o profesor para acceder con su número de DNI.
          </p>
        </div>

        {/* Tabs: Alumno vs Profesor */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Nuevo Alumno</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('coach');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'coach'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Nuevo Profesor</span>
          </button>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form: Nuevo Alumno */}
        {activeTab === 'student' && (
          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Número de DNI <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={studentDni}
                  onChange={(e) => setStudentDni(e.target.value)}
                  placeholder="ej. 40123456"
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Nombre Completo <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="ej. Lucas Benítez"
                  required
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Nivel de Experiencia
                </label>
                <select
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value as ClientProfile['level'])}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                >
                  <option value="Principiante">Principiante (0 - 6 meses)</option>
                  <option value="Intermedio">Intermedio (6m - 2 años)</option>
                  <option value="Avanzado">Avanzado (+2 años)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  value={studentGoal}
                  onChange={(e) => setStudentGoal(e.target.value)}
                  placeholder="ej. Hipertrofia & Piernas"
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={studentWeight}
                  onChange={(e) => setStudentWeight(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={studentHeight}
                  onChange={(e) => setStudentHeight(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Profesor Asignado
              </label>
              <select
                value={studentCoach}
                onChange={(e) => setStudentCoach(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              >
                {coaches.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Indicación Inicial del Profesor (Opcional)
              </label>
              <input
                type="text"
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="ej. Priorizar técnica en sentadilla libre."
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Alumno</span>
            </button>
          </form>
        )}

        {/* Form: Nuevo Profesor */}
        {activeTab === 'coach' && (
          <form onSubmit={handleRegisterCoach} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Número de DNI del Profesor <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={coachDni}
                onChange={(e) => setCoachDni(e.target.value)}
                placeholder="ej. 28990123"
                required
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Este DNI será la clave exclusiva con la que el profesor accederá a administrar rutinas.
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Nombre Completo del Profesor <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="ej. Prof. Esteban Rossi"
                required
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Especialidad / Rol
              </label>
              <input
                type="text"
                value={coachSpecialty}
                onChange={(e) => setCoachSpecialty(e.target.value)}
                placeholder="ej. Head Coach - Musculación & Fuerza"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Teléfono o Contacto (Opcional)
              </label>
              <input
                type="text"
                value={coachPhone}
                onChange={(e) => setCoachPhone(e.target.value)}
                placeholder="ej. +54 9 11 3344-5566"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
            >
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Profesor</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
