import React, { useState } from 'react';
import { User, Check, X, Shield, Dumbbell } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ClientProfile } from '../types/fitness';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { clients, currentClient, selectClient, updateClient } = useWorkout();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentClient?.name ?? '');
  const [goal, setGoal] = useState(currentClient?.goal ?? '');
  const [weight, setWeight] = useState(currentClient?.bodyWeightKg ? String(currentClient.bodyWeightKg) : '70');
  const [height, setHeight] = useState(currentClient?.heightCm ? String(currentClient.heightCm) : '170');
  const [level, setLevel] = useState<ClientProfile['level']>(currentClient?.level ?? 'Intermedio');

  React.useEffect(() => {
    if (currentClient) {
      setName(currentClient.name ?? '');
      setGoal(currentClient.goal ?? '');
      setWeight(currentClient.bodyWeightKg !== undefined ? String(currentClient.bodyWeightKg) : '70');
      setHeight(currentClient.heightCm !== undefined ? String(currentClient.heightCm) : '170');
      setLevel(currentClient.level ?? 'Intermedio');
    }
  }, [currentClient, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateClient({
      name: (name ?? '').trim() || currentClient?.name || 'Alumno',
      goal: (goal ?? '').trim() || currentClient?.goal || 'Fuerza',
      bodyWeightKg: parseFloat(weight) || currentClient?.bodyWeightKg || 70,
      heightCm: parseFloat(height) || currentClient?.heightCm || 170,
      level,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-white">
              Perfil del Cliente / Gimnasio
            </h3>
            <p className="text-xs text-neutral-400">
              Selecciona el atleta activo o actualiza sus medidas corporales
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switch Client Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Cambiar Atleta Activo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {clients.map((client) => {
              const isSelected = client.id === currentClient.id;
              return (
                <button
                  key={client.id}
                  onClick={() => {
                    selectClient(client.id);
                    setName(client.name);
                    setGoal(client.goal);
                    setWeight(client.bodyWeightKg.toString());
                    setHeight(client.heightCm.toString());
                    setLevel(client.level);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold block truncate">
                        {client.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {client.level}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    DNI: {client.dni} · {client.bodyWeightKg}kg
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Edit Info Form */}
        <div className="pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Datos Personales de {currentClient.name}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              {isEditing ? 'Cancelar Edición' : 'Editar Datos'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name ?? ''}
                    onChange={(e) => setName(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Nivel
                  </label>
                  <select
                    value={level ?? 'Intermedio'}
                    onChange={(e) => setLevel(e.target.value as ClientProfile['level'])}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Objetivo Principal de Entrenamiento
                </label>
                <input
                  type="text"
                  value={goal ?? ''}
                  onChange={(e) => setGoal(e.target.value ?? '')}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Peso Corporal (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight ?? ''}
                    onChange={(e) => setWeight(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Estatura (cm)
                  </label>
                  <input
                    type="number"
                    value={height ?? ''}
                    onChange={(e) => setHeight(e.target.value ?? '')}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">DNI del Alumno:</span>
                <span className="font-mono text-amber-400 font-bold">{currentClient.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Membresía ID:</span>
                <span className="font-mono text-neutral-200">{currentClient.membershipId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Coach Asignado:</span>
                <span className="text-neutral-200">{currentClient.coach}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Peso Corporal:</span>
                <span className="font-mono text-neutral-200">{currentClient.bodyWeightKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estatura:</span>
                <span className="font-mono text-neutral-200">{currentClient.heightCm} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Objetivo:</span>
                <span className="text-amber-400 font-semibold">{currentClient.goal}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
