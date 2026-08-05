import React, { useState } from 'react';
import { StageTask, User, Attachment } from '../types';
import { MentionInput } from './MentionInput';
import { FileUploader } from './FileUploader';
import { exportTasksToExcel } from '../utils/exportToExcel';
import { 
  ClipboardPlus, Calendar, UserCheck, FileText, ArrowRight, Play, 
  Sparkles, CheckCircle, Clock, Paperclip, AlertCircle, Eye, Search, FileSpreadsheet, Check
} from 'lucide-react';

interface TaskCreatePageProps {
  tasks: StageTask[];
  currentUser: User;
  allUsers: User[];
  onCreateTask: (taskData: {
    fecha: string;
    tarea: string;
    observacion: string;
    adjuntos: Attachment[];
    usuarioCreador: User;
    usuarioAsignado?: User;
    usuariosAsignados?: User[];
  }) => void;
  onStartWorkingTask: (task: StageTask) => void;
  onViewTaskDetail: (task: StageTask) => void;
}

export const TaskCreatePage: React.FC<TaskCreatePageProps> = ({
  tasks,
  currentUser,
  allUsers,
  onCreateTask,
  onStartWorkingTask,
  onViewTaskDetail
}) => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tarea, setTarea] = useState('');
  const [observacion, setObservacion] = useState('');
  const [adjuntos, setAdjuntos] = useState<Attachment[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([currentUser.id]);
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pendingTasks = tasks.filter(t => t.stage === 'pendiente');
  const filteredPendingTasks = pendingTasks.filter(t =>
    t.tarea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.observacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.usuarioCreador.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAssignUser = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      if (assignedUserIds.length > 1) {
        setAssignedUserIds(assignedUserIds.filter(id => id !== userId));
      }
    } else {
      setAssignedUserIds([...assignedUserIds, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarea.trim()) return;

    const selectedUsers = allUsers.filter(u => assignedUserIds.includes(u.id));

    onCreateTask({
      fecha,
      tarea: tarea.trim(),
      observacion: observacion.trim(),
      adjuntos,
      usuarioCreador: currentUser,
      usuarioAsignado: selectedUsers[0],
      usuariosAsignados: selectedUsers
    });

    setTarea('');
    setObservacion('');
    setAdjuntos([]);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <ClipboardPlus className="w-3.5 h-3.5" /> Página 1 • Carga Inicial de Tarea
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ingreso de Nueva Tarea o Requerimiento
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Completa el encabezado con la fecha, título de la tarea, observaciones con menciones <span className="text-indigo-300 font-mono font-bold">@usuario</span> y adjuntos opcionales. Al comenzar a trabajarla, pasará automáticamente a <span className="text-emerald-300 font-bold">"En Proceso"</span>.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Pending List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Panel */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800">Formulario de Carga</h2>
                <p className="text-[11px] text-slate-400">Ingreso oficial de requerimiento al flujo</p>
              </div>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
              Etapa: Pendiente
            </span>
          </div>

          {isSuccessToast && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in zoom-in-95 duration-150">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>¡Tarea cargada exitosamente!</strong> Se ha enviado la notificación por chat.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Header Data (Fecha, Usuario) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fecha del Requerimiento
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Usuario Responsable / Creador
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({currentUser.department})</span>
                </div>
              </div>
            </div>

            {/* Task Title / Tarea */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Encabezado / Tarea *
                </span>
                <span className="text-[10px] text-slate-400">Requerido</span>
              </label>
              <input
                type="text"
                required
                value={tarea}
                onChange={e => setTarea(e.target.value)}
                placeholder="Ej. Revisión y carga de códigos de repuestos en suspensión"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold outline-none transition bg-white text-slate-800"
              />
            </div>

            {/* Multi Assignee Selection */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Asignar Tarea a (Permite múltiples personas):
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {assignedUserIds.length} seleccionado(s)
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allUsers.map(u => {
                  const isSelected = assignedUserIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleAssignUser(u.id)}
                      className={`p-2 rounded-xl border transition flex items-center justify-between cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{u.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{u.role}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de Observación with @ mentions */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                <span>Campo de Observación (Usa @ para mencionar usuarios)</span>
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Envía email automático
                </span>
              </label>
              <MentionInput
                value={observacion}
                onChange={setObservacion}
                users={allUsers}
                multiline
                rows={3}
                placeholder="Agrega detalles del trabajo, indicaciones o menciona a tus compañeros con @correo..."
              />
            </div>

            {/* Archivo Adjunto */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Archivos Adjuntos (Documentos, Imágenes, PDFs):
              </label>
              <FileUploader
                attachments={adjuntos}
                onAddAttachment={att => setAdjuntos([...adjuntos, att])}
                onRemoveAttachment={id => setAdjuntos(adjuntos.filter(a => a.id !== id))}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ClipboardPlus className="w-4 h-4" />
                <span>Cargar Tarea al Flujo</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Pending Tasks Stream & Quick Move to En Proceso */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Tareas Pendientes por Trabajar
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {filteredPendingTasks.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Haz clic en "Empezar a Trabajar" para pasarla a la página de En Proceso.
              </p>
            </div>

            <button
              type="button"
              onClick={() => exportTasksToExcel(tasks, 'Reporte_Todas_las_Tareas_CollabTask.csv')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title="Exportar todas las tareas a Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar a Excel</span>
            </button>
          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar tareas pendientes por título, observaciones o creador..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            />
          </div>

          {filteredPendingTasks.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">No se encontraron tareas pendientes.</p>
              <p className="text-[11px] text-slate-400">Prueba ajustando el filtro de búsqueda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingTasks.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          Pendiente
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.fecha}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                        {t.tarea}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartWorkingTask(t)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>Empezar a Trabajar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {t.observacion && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic line-clamp-2">
                      "{t.observacion}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Cargada por:</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <img
                          src={t.usuarioCreador.avatar}
                          alt={t.usuarioCreador.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        {t.usuarioCreador.name}
                      </span>
                    </div>

                    {t.adjuntos && t.adjuntos.length > 0 && (
                      <span className="text-indigo-600 font-semibold flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {t.adjuntos.length} adjunto(s)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
