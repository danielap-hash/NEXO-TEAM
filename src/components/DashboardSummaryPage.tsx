import React from 'react';
import { StageTask, TrelloCard, User, ChatMessage, NotificationItem } from '../types';
import { exportTasksToExcel, exportTrelloToExcel } from '../utils/exportToExcel';
import { 
  BarChart3, CheckCircle2, Clock, PlayCircle, Layers, Users, 
  Sparkles, ShieldAlert, FileSpreadsheet, TrendingUp, Activity,
  Check, UserCheck, MessageSquare, ArrowUpRight, Flame
} from 'lucide-react';

interface DashboardSummaryPageProps {
  tasks: StageTask[];
  cards: TrelloCard[];
  users: User[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
}

export const DashboardSummaryPage: React.FC<DashboardSummaryPageProps> = ({
  tasks,
  cards,
  users,
  chatMessages,
  notifications
}) => {
  // Stage Tasks Stats
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.stage === 'pendiente');
  const inProgressTasks = tasks.filter(t => t.stage === 'en_proceso');
  const completedTasks = tasks.filter(t => t.stage === 'finalizado');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Trello Cards Stats
  const totalCards = cards.length;
  const cardsTarea = cards.filter(c => c.columna === 'tarea');
  const cardsProceso = cards.filter(c => c.columna === 'en_proceso');
  const cardsFinalizado = cards.filter(c => c.columna === 'finalizado');
  const cardsSuspendido = cards.filter(c => c.columna === 'suspendido');

  // Priority counts
  const priorityCounts = {
    urgente: cards.filter(c => c.prioridad === 'urgente').length,
    alta: cards.filter(c => c.prioridad === 'alta').length,
    media: cards.filter(c => c.prioridad === 'media').length,
    baja: cards.filter(c => c.prioridad === 'baja').length,
  };

  // Export combined report
  const handleExportGlobal = () => {
    exportTasksToExcel(tasks, 'Reporte_General_Flujo_Tareas_NexoTeam.csv');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <BarChart3 className="w-3.5 h-3.5" /> Dashboard Resumen • Nexo Team
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Resumen General de Estado de Tareas
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Consolidado en tiempo real de requerimientos por flujo de etapas, tarjetas del tablero Kanban, balance de carga de trabajo del equipo y actividad reciente.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button
            onClick={handleExportGlobal}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Informe Global Excel</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tasks Metric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flujo Requerimientos</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalTasks}</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Total de tareas registradas</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-600">{completionRate}% completadas</span>
            <span className="text-slate-400">{completedTasks.length}/{totalTasks} fin</span>
          </div>
        </div>

        {/* Pendientes Metric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Tareas Pendientes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{pendingTasks.length}</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Listas para iniciar asignación</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (pendingTasks.length / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* En Proceso Metric */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">En Ejecución Activa</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{inProgressTasks.length}</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Con actualización de estado abierto</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Trello Kanban Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Tablero Trello</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalCards}</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Tarjetas en 4 columnas Kanban</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="text-rose-500">{cardsSuspendido.length} suspendidas</span>
            <span className="text-emerald-600">{cardsFinalizado.length} listos</span>
          </div>
        </div>

      </div>

      {/* Grid Section 2: Visual Distribution Charts & Kanban Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Stage Tasks Flow Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Distribución por Etapas de Trabajo
              </h3>
              <p className="text-[11px] text-slate-400">Estado de avance de requerimientos generales</p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
              {totalTasks} Tareas
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Pendiente */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pendientes por iniciar
                </span>
                <span className="font-bold text-slate-900">{pendingTasks.length} ({totalTasks > 0 ? Math.round((pendingTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (pendingTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* En proceso */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> En Proceso / En Ejecución
                </span>
                <span className="font-bold text-slate-900">{inProgressTasks.length} ({totalTasks > 0 ? Math.round((inProgressTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Finalizadas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Finalizadas
                </span>
                <span className="font-bold text-slate-900">{completedTasks.length} ({totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Resumen de Sub-Estados Activos ("En Proceso"):</h4>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {inProgressTasks.map(t => (
                <span key={t.id} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <strong>{t.tarea.length > 25 ? t.tarea.substring(0, 25) + '...' : t.tarea}:</strong> {t.estadoDetalle || 'Alta'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trello Kanban Column Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" /> Tablero Trello — Estado por Columnas
              </h3>
              <p className="text-[11px] text-slate-400">Clasificación de tarjetas en las 4 columnas del tablero</p>
            </div>
            <button
              onClick={() => exportTrelloToExcel(cards, 'Reporte_Tablero_Trello_Dashboard.csv')}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Trello
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">1. Tarea</span>
              <div className="text-2xl font-black text-blue-900">{cardsTarea.length}</div>
              <p className="text-[10px] text-blue-600">Tarjetas pendientes</p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">2. En Proceso</span>
              <div className="text-2xl font-black text-indigo-900">{cardsProceso.length}</div>
              <p className="text-[10px] text-indigo-600">Trabajo en ejecución</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">3. Finalizado</span>
              <div className="text-2xl font-black text-emerald-900">{cardsFinalizado.length}</div>
              <p className="text-[10px] text-emerald-600">Completados con éxito</p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">4. Suspendido</span>
              <div className="text-2xl font-black text-rose-900">{cardsSuspendido.length}</div>
              <p className="text-[10px] text-rose-600">Pausado / En espera</p>
            </div>

          </div>

          {/* Priority Breakdown */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Clasificación por Prioridad:
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold block">URGENTE</span>
                <span className="font-extrabold text-rose-600">{priorityCounts.urgente}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold block">ALTA</span>
                <span className="font-extrabold text-amber-600">{priorityCounts.alta}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold block">MEDIA</span>
                <span className="font-extrabold text-indigo-600">{priorityCounts.media}</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold block">BAJA</span>
                <span className="font-extrabold text-emerald-600">{priorityCounts.baja}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Team Workload & Member Assignments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Carga de Trabajo y Asignación por Usuario
            </h3>
            <p className="text-xs text-slate-400">Resumen de miembros del equipo Nexo Team y sus tareas asignadas</p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {users.length} Integrantes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map(u => {
            // Tasks assigned to this user
            const assignedTasks = tasks.filter(t => 
              t.usuarioAsignado?.id === u.id || 
              (t.usuariosAsignados && t.usuariosAsignados.some(au => au.id === u.id))
            );
            const activeAssigned = assignedTasks.filter(t => t.stage === 'en_proceso' || t.stage === 'pendiente');
            
            // Trello cards assigned
            const assignedTrello = cards.filter(c => c.asignados && c.asignados.some(au => au.id === u.id));

            return (
              <div key={u.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-indigo-300 transition">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white shadow-xs" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${u.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-slate-800 text-xs truncate">{u.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{u.role}</p>
                    <span className="text-[9px] text-indigo-600 font-semibold">{u.department}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Tareas Flujo</span>
                    <span className="font-black text-indigo-600 text-sm">{assignedTasks.length}</span>
                    <span className="text-[9px] text-slate-500 block">({activeAssigned.length} activas)</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Trello</span>
                    <span className="font-black text-purple-600 text-sm">{assignedTrello.length}</span>
                    <span className="text-[9px] text-slate-500 block">tarjetas</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
