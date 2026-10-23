import React, { useState } from 'react';
import {
  Dumbbell,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Tablet,
  Smartphone,
  Delete,
  UserPlus,
  Download,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { RegisterModal } from './RegisterModal';
import { ExportCodeModal } from './ExportCodeModal';

interface DniLoginProps {
  onSuccessLogin: () => void;
  onEnterAsCoach: () => void;
}

export const DniLogin: React.FC<DniLoginProps> = ({
  onSuccessLogin,
  onEnterAsCoach,
}) => {
  const {
    gymName,
    loginWithDni,
    loginAsCoachWithDni,
    quickRegisterAndLoginStudent,
    quickRegisterAndLoginCoach,
    deviceMode,
    setDeviceMode,
  } = useWorkout();

  // Portal selection: 'select' (default two buttons), 'student', or 'coach'
  const [selectedPortal, setSelectedPortal] = useState<'select' | 'student' | 'coach'>('select');

  // Input states
  const [dniInput, setDniInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Register and Export modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [registerInitialTab, setRegisterInitialTab] = useState<'student' | 'coach'>('student');

  const handleStudentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const safeValue = (dniInput ?? '').trim();
    if (!safeValue) {
      setErrorMessage('Por favor escribe tu número de DNI.');
      return;
    }

    const res = loginWithDni(safeValue);
    if (res.success) {
      onSuccessLogin();
    } else {
      setErrorMessage(res.message || 'DNI no encontrado.');
    }
  };

  const handleCoachSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const safeValue = (dniInput ?? '').trim();
    if (!safeValue) {
      setErrorMessage('Por favor escribe tu número de DNI de profesor.');
      return;
    }

    const res = loginAsCoachWithDni(safeValue);
    if (res.success) {
      onEnterAsCoach();
    } else {
      setErrorMessage(res.message || 'DNI de profesor no encontrado.');
    }
  };


  const handleInstantRegisterStudent = () => {
    const safeValue = (dniInput ?? '').trim();
    if (!safeValue) {
      setErrorMessage('Por favor escribe un número de DNI.');
      return;
    }
    quickRegisterAndLoginStudent(safeValue);
    onSuccessLogin();
  };

  const handleInstantRegisterCoach = () => {
    const safeValue = (dniInput ?? '').trim();
    if (!safeValue) {
      setErrorMessage('Por favor escribe tu número de DNI.');
      return;
    }
    quickRegisterAndLoginCoach(safeValue);
    onEnterAsCoach();
  };

  const handleKeypadPress = (num: string) => {
    if (dniInput.length < 11) {
      setDniInput((prev) => (prev ?? '') + num);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleKeypadBackspace = () => {
    setDniInput((prev) => (prev ?? '').slice(0, -1));
  };

  const handleKeypadClear = () => {
    setDniInput('');
    setErrorMessage('');
  };

  const isTablet = deviceMode === 'tablet_kiosk';

  return (
    <div className="min-h-[92vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Device Mode Switcher Banner */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setDeviceMode('personal')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              !isTablet
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Modo Celular</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet_kiosk')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isTablet
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet de Sala</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
            {gymName ? `${gymName} Gym Tracker` : 'IronTrack Gym Tracker'}
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {selectedPortal === 'select'
              ? 'Ingresa con tu DNI para ver tu rutina o administrar las rutinas del gimnasio'
              : selectedPortal === 'student'
              ? 'Terminal de Alumno: Ingresa tu DNI para ver tu rutina y registrar tus series.'
              : 'Acceso para Profesores y Entrenadores: Ingresa tu DNI para administrar rutinas.'}
          </p>

          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:border-amber-500/60 text-neutral-300 hover:text-amber-400 text-xs font-semibold shadow-sm transition-all group cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Descargar Proyecto en Archivo ZIP</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded font-mono">.zip</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Dual Buttons ("Entrenar" vs "Administrar Rutinas") */}
        {selectedPortal === 'select' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">

            {/* Regular Dual Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: ENTRENAR (Alumno) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('student');
                  setDniInput('');
                  setErrorMessage('');
                }}
                className="group relative p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 transition-all text-left space-y-4 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      Soy Alumno / Socio
                    </span>
                    <h2 className="text-2xl font-display font-extrabold text-white group-hover:text-amber-400 transition-colors">
                      Entrenar
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      Ingresar con mi DNI personal, ver mi rutina del día y tildar series.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Escribir DNI</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: ADMINISTRAR RUTINAS (Profesor / Entrenador) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('coach');
                  setDniInput('');
                  setErrorMessage('');
                }}
                className="group relative p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 transition-all text-left space-y-4 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-200 group-hover:bg-amber-500 group-hover:text-neutral-950 group-hover:border-amber-500 transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                      Soy Profesor / Entrenador
                    </span>
                    <h2 className="text-2xl font-display font-extrabold text-white group-hover:text-amber-400 transition-colors">
                      Administrar Rutinas
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                      Crear rutinas, ver alumnos activos en vivo y monitorear el gimnasio.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Acceso Profesor (DNI)</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Quick Register Action on Home Screen */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialTab('student');
                  setIsRegisterOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>¿Nuevo socio o profesor? <strong>Registrar alta aquí</strong></span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: DNI Form for Student ("Entrenar") */}
        {selectedPortal === 'student' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('select');
                  setErrorMessage('');
                  setDniInput('');
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a opciones</span>
              </button>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                Acceso Alumno
              </span>
            </div>



            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="student-dni-input"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2"
                >
                  O escribe tu número de DNI / Cédula
                </label>

                <div className="relative">
                  <input
                    id="student-dni-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={dniInput ?? ''}
                    onChange={(e) => {
                      setDniInput(e.target.value ?? '');
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="ej. 38452190"
                    autoFocus
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-xl font-mono font-bold text-center text-white placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                  {dniInput && (
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white py-1 px-2 rounded cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-center space-y-2">
                    <p className="text-xs text-red-300 font-medium leading-relaxed">
                      {errorMessage}
                    </p>
                    {dniInput.trim().length >= 3 && (
                      <button
                        type="button"
                        onClick={handleInstantRegisterStudent}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Crear mi ficha de alumno y entrar ahora con DNI {dniInput.trim()}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* On-Screen Touch Keypad in Tablet mode */}
              {isTablet && (
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xl font-mono font-bold text-white flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      Borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xl font-mono font-bold text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      title="Retroceso"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-13 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Ingresar y Ver Mi Rutina</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialTab('student');
                  setIsRegisterOpen(true);
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                ¿No estás registrado? <strong>Crear nuevo alumno con DNI</strong>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: DNI Form for Coach ("Administrar Rutinas") */}
        {selectedPortal === 'coach' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPortal('select');
                  setErrorMessage('');
                  setDniInput('');
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a opciones</span>
              </button>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                Acceso Profesor
              </span>
            </div>

            <form onSubmit={handleCoachSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="coach-dni-input"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2"
                >
                  Escribe tu número de DNI de Profesor
                </label>

                <div className="relative">
                  <input
                    id="coach-dni-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={dniInput ?? ''}
                    onChange={(e) => {
                      setDniInput(e.target.value ?? '');
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="ej. 28100200"
                    autoFocus
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-xl font-mono font-bold text-center text-white placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                  {dniInput && (
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white py-1 px-2 rounded cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-center space-y-2">
                    <p className="text-xs text-red-300 font-medium leading-relaxed">
                      {errorMessage}
                    </p>
                    {dniInput.trim().length >= 3 && (
                      <button
                        type="button"
                        onClick={handleInstantRegisterCoach}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Crear ficha de profesor y entrar ahora con DNI {dniInput.trim()}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* On-Screen Touch Keypad in Tablet mode */}
              {isTablet && (
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xl font-mono font-bold text-white flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleKeypadClear}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      Borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xl font-mono font-bold text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleKeypadBackspace}
                      className="h-14 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      title="Retroceso"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-13 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-neutral-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Ingresar como Profesor</span>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setRegisterInitialTab('coach');
                  setIsRegisterOpen(true);
                }}
                className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                ¿Nuevo profesor? <strong>Registrar profesor en el sistema</strong>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal accessible directly from Welcome Screen */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialTab={registerInitialTab}
        onStudentRegistered={(student) => {
          loginWithDni(student.dni);
          onSuccessLogin();
        }}
        onCoachRegistered={() => {
          onEnterAsCoach();
        }}
      />

      {/* Code Export / Download Modal */}
      <ExportCodeModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
