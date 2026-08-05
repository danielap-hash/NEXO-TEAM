import React, { useState } from 'react';
import { StageTask, User } from '../types';
import { FileUploader } from './FileUploader';
import { exportTasksToExcel } from '../utils/exportToExcel';
import { 
  CheckCircle2, Calendar, Clock, UserCheck, Search, Download, 
  RotateCcw, History, FileText, Paperclip, Sparkles, Filter, FileSpreadsheet
} from 'lucide-react';

interface TaskCompletedPageProps {
  tasks: StageTask[];
  onReopenTask: (task: StageTask) => void;
}

export const TaskCompletedPage: React.FC<TaskCompletedPageProps> = ({ tasks, onReopenTask }) => {
  const completedTasks = tasks.filter(t => t.stage === 'finalizado');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = completedTasks.filter(t =>
    t.tarea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.observacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.usuarioCreador.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Página 3 • Historial de Tareas Finalizadas
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trazabilidad y Registro de Tareas Resueltas
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Consulta todas las tareas concluidas, sus fechas de cierre, adjuntos finales descargables y la bitácora completa de cambios de estado.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar en finalizadas por título, usuario, observación..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Total Finalizadas:</span>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {filteredTasks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => exportTasksToExcel(completedTasks, 'Reporte_Tareas_Finalizadas.csv')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            title="Exportar tareas finalizadas a Excel CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Finalizadas a Excel</span>
          </button>
        </div>
      </div>

      {/* Completed Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No hay tareas en el historial de finalizados</h3>
          <p className="text-xs text-slate-400">
            Las tareas completadas desde las Páginas 1 y 2 aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.map(t => {
            const finalHistory = t.historialEstados?.[t.historialEstados.length - 1];

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Finalizado
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t.fecha}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">
                      {t.tarea}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onReopenTask(t)}
                    title="Reabrir tarea a En Proceso"
                    className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reabrir</span>
                  </button>
                </div>

                {t.observacion && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Observación Inicial:</strong> {t.observacion}
                  </p>
                )}

                {/* Final status note */}
                {finalHistory && finalHistory.notas && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="font-bold text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Nota de Resolución Final:
                    </div>
                    <p className="italic">"{finalHistory.notas}"</p>
                  </div>
                )}

                {/* Attachments */}
                {t.adjuntos && t.adjuntos.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-slate-400" /> Archivos Adjuntos ({t.adjuntos.length}):
                    </span>
                    <FileUploader
                      attachments={t.adjuntos}
                      onAddAttachment={() => {}}
                      onRemoveAttachment={() => {}}
                      readOnly
                    />
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Creada por:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <img
                        src={t.usuarioCreador.avatar}
                        alt={t.usuarioCreador.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      {t.usuarioCreador.name}
                    </span>
                  </div>

                  <span className="text-slate-400">
                    Cierre: {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('es-ES') : t.fecha}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
