import React, { useState } from 'react';
import { StageTask, User, Attachment } from '../types';
import { MentionInput } from './MentionInput';
import { FileUploader } from './FileUploader';
import { exportTasksToExcel } from '../utils/exportToExcel';
import { 
  PlayCircle, CheckCircle2, Clock, MessageSquare, Paperclip, Sparkles, 
  Send, History, ShieldAlert, Tag, UserCheck, AlertCircle, ChevronRight, Edit3, Search, FileSpreadsheet
} from 'lucide-react';

interface TaskInProgressPageProps {
  tasks: StageTask[];
  currentUser: User;
  allUsers: User[];
  onUpdateTaskStatus: (
    taskId: string,
    estadoDetalle: string,
    notasEstado: string,
    stage?: 'en_proceso' | 'finalizado',
    nuevoComentario?: string,
    adjuntos?: Attachment[]
  ) => void;
  onFinishTask: (task: StageTask) => void;
}

export const TaskInProgressPage: React.FC<TaskInProgressPageProps> = ({
  tasks,
  currentUser,
  allUsers,
  onUpdateTaskStatus,
  onFinishTask
}) => {
  const inProgressTasks = tasks.filter(t => t.stage === 'en_proceso');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInProgressTasks = inProgressTasks.filter(t =>
    t.tarea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.observacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.estadoDetalle && t.estadoDetalle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.usuarioCreador.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pre-set status options requested by user
  const presetStatuses = [
    'Alta',
    'En manos del proveedor',
    'Códigos Suspendidos',
    'OC Pendiente',
    'En Revisión Técnica',
    'Esperando Documentación',
    'Finalizar'
  ];

  // Local state for expanding card editing
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [activeTaskAttachments, setActiveTaskAttachments] = useState<Attachment[]>([]);

  const handleOpenTaskEditor = (task: StageTask) => {
    setSelectedTaskId(task.id);
    setCustomStatusInput(task.estadoDetalle || 'Alta');
    setStatusNotes('');
    setCommentInput('');
    setActiveTaskAttachments(task.adjuntos || []);
  };

  const handleSaveStatusChange = (task: StageTask) => {
    if (!customStatusInput.trim()) return;

    const isFinalizing = customStatusInput === 'Finalizar';

    onUpdateTaskStatus(
      task.id,
      customStatusInput.trim(),
      statusNotes.trim(),
      isFinalizing ? 'finalizado' : 'en_proceso',
      commentInput.trim() || undefined,
      activeTaskAttachments
    );

    setStatusNotes('');
    setCommentInput('');
    if (isFinalizing) {
      setSelectedTaskId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
            <PlayCircle className="w-3.5 h-3.5" /> Página 2 • Tareas En Proceso
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gestión y Actualización de Estado Abierto
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Ingresa o selecciona el estado actual de la tarea (<span className="text-emerald-300 font-bold">Alta, En manos del proveedor, Códigos Suspendidos, OC Pendiente</span>, etc.). Menciona a compañeros con <span className="text-indigo-300 font-bold font-mono">@correo</span> para notificar por email simulado en tiempo real.
          </p>
        </div>
      </div>

      {inProgressTasks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <PlayCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No hay tareas en proceso en este momento</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ve a la <strong className="text-indigo-600">Página 1 (Cargar Tarea)</strong> y presiona "Empezar a Trabajar" para mover tareas a esta sección.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Task List Column */}
          <div className={`${selectedTaskId ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Tareas Activas en Ejecución
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {filteredInProgressTasks.length}
                </span>
              </h2>

              <button
                type="button"
                onClick={() => exportTasksToExcel(inProgressTasks, 'Reporte_Tareas_En_Proceso.csv')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                title="Exportar tareas en proceso a Excel CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar En Proceso a Excel</span>
              </button>
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar tareas en proceso por título, estado, notas o creador..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              />
            </div>

            {filteredInProgressTasks.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                <PlayCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium">No se encontraron tareas coincidentes.</p>
                <p className="text-[11px] text-slate-400">Intenta con otro término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {filteredInProgressTasks.map(t => {
                const isEditing = selectedTaskId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`bg-white rounded-2xl border transition p-5 space-y-4 ${
                      isEditing
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Estado: {t.estadoDetalle || 'En Proceso'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Creada: {t.fecha}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base">
                          {t.tarea}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenTaskEditor(t)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Actualizar Estado</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onFinishTask(t)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finalizar</span>
                        </button>
                      </div>
                    </div>

                    {t.observacion && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong>Observaciones:</strong> {t.observacion}
                      </p>
                    )}

                    {/* History chips */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Responsable:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <img
                            src={t.usuarioCreador.avatar}
                            alt={t.usuarioCreador.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          {t.usuarioCreador.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {t.comentarios && t.comentarios.length > 0 && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-indigo-500" /> {t.comentarios.length} comentarios
                          </span>
                        )}
                        {t.adjuntos && t.adjuntos.length > 0 && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Paperclip className="w-3 h-3 text-indigo-500" /> {t.adjuntos.length}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Editor / Status Update Panel (Right Column when selected) */}
          {selectedTaskId && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-xl border border-indigo-200 p-6 space-y-6 sticky top-20 animate-in slide-in-from-right-4 duration-200">
              
              {(() => {
                const task = tasks.find(t => t.id === selectedTaskId);
                if (!task) return null;

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                          Panel de Edición en Tiempo Real
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                          {task.tarea}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedTaskId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Cerrar ✕
                      </button>
                    </div>

                    {/* Pre-set Status Picker */}
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-bold text-xs">
                        Selecciona o Ingresa el Estado Abierto:
                      </label>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {presetStatuses.map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setCustomStatusInput(status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              customStatusInput === status
                                ? status === 'Finalizar'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={customStatusInput}
                        onChange={e => setCustomStatusInput(e.target.value)}
                        placeholder="O escribe un estado personalizado..."
                        className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-xs outline-none bg-white text-slate-800"
                      />
                    </div>

                    {/* Status Note / Details */}
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">
                        Notas de Avance / Novedad sobre el Estado:
                      </label>
                      <MentionInput
                        value={statusNotes}
                        onChange={setStatusNotes}
                        users={allUsers}
                        multiline
                        rows={2}
                        placeholder="Escribe detalles del estado actual o menciona con @..."
                      />
                    </div>

                    {/* Add Comment with @mention */}
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center justify-between">
                        <span>Agregar Comentario a la Bitácora</span>
                        <span className="text-[10px] text-indigo-600 font-medium">
                          Usa @ para alertar por correo
                        </span>
                      </label>
                      <MentionInput
                        value={commentInput}
                        onChange={setCommentInput}
                        users={allUsers}
                        placeholder="Comentario para el equipo..."
                      />
                    </div>

                    {/* Attachment Manager */}
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">
                        Documentos y Adjuntos de la Tarea:
                      </label>
                      <FileUploader
                        attachments={activeTaskAttachments}
                        onAddAttachment={att => setActiveTaskAttachments([...activeTaskAttachments, att])}
                        onRemoveAttachment={id => setActiveTaskAttachments(activeTaskAttachments.filter(a => a.id !== id))}
                      />
                    </div>

                    {/* Save / Finalize Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleSaveStatusChange(task)}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Guardar y Actualizar Estado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomStatusInput('Finalizar');
                          handleSaveStatusChange(task);
                        }}
                        className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Finalizar Tarea</span>
                      </button>
                    </div>

                    {/* Timeline Log of States */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-indigo-500" /> Historial de Cambios de Estado
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {task.historialEstados && task.historialEstados.map((h, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="text-indigo-600">{h.estado}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(h.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-slate-600">Por: <strong>{h.usuarioName}</strong></p>
                            {h.notas && <p className="text-slate-500 italic font-mono text-[10px]">"{h.notas}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                  </>
                );
              })()}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
