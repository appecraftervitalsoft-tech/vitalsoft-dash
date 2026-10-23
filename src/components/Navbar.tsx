import React from 'react';
import { Volume2, VolumeX, ShieldCheck, LogOut, Flame, Activity, Download } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { formatTime } from '../utils/calculator';
import { ExportCodeModal } from './ExportCodeModal';

interface NavbarProps {
  activeTab: 'routine' | 'active' | 'progress' | 'tools' | 'coach';
  setActiveTab: (tab: 'routine' | 'active' | 'progress' | 'tools' | 'coach') => void;
  onOpenClientModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenClientModal,
  onLogout,
}) => {
  const {
    gymName,
    currentUserRole,
    currentClient,
    activeWorkout,
    workoutDurationSec,
    isMuted,
    toggleMute,
    loginAsCoach,
  } = useWorkout();

  const isCoach = currentUserRole === 'coach';
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab(isCoach ? 'coach' : 'routine')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-colors">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <span className="font-display text-xl sm:text-2xl font-extrabold tracking-wider uppercase text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
              {gymName ? `${gymName} Gym Tracker` : 'IronTrack Gym Tracker'}
            </span>
          </button>

          {isCoach && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hidden md:inline-block">
              Modo Profesor
            </span>
          )}
        </div>

        {/* Zone 2: Nav Tabs */}
        {!isCoach ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('routine')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                activeTab === 'routine'
                  ? 'text-amber-400 bg-neutral-900 border border-neutral-800 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Mi Rutina
            </button>

            {activeWorkout && (
              <button
                onClick={() => setActiveTab('active')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                  activeTab === 'active'
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>En Vivo ({formatTime(workoutDurationSec)})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('progress')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                activeTab === 'progress'
                  ? 'text-amber-400 bg-neutral-900 border border-neutral-800 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Progreso
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                activeTab === 'tools'
                  ? 'text-amber-400 bg-neutral-900 border border-neutral-800 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Calculadoras
            </button>
          </nav>
        ) : (
          <div className="text-xs text-neutral-400 hidden sm:block">
            Panel de Carga y Asignación de Rutinas
          </div>
        )}

        {/* Zone 3: Coach Toggle, Sound & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Alternar sonido"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            title="Descargar todo el código fuente en archivo ZIP"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar Código</span>
          </button>

          {!isCoach ? (
            <>
              <button
                onClick={onLogout}
                title="Salir a la pantalla de inicio"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>

              <button
                onClick={onOpenClientModal}
                className="flex items-center gap-2 px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-neutral-700 transition-colors text-left cursor-pointer"
              >
                <img
                  src={currentClient.avatar}
                  alt={currentClient.name}
                  className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-neutral-200 leading-tight block max-w-[100px] truncate">
                    {currentClient.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block leading-tight">
                    DNI: {currentClient.dni}
                  </span>
                </div>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Cerrar Sesión de Profesor"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ExportCodeModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </header>
  );
};
