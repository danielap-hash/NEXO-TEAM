import React from 'react';
import { SimulatedEmail } from '../types';
import { Mail, X, Send, Calendar, CheckCircle, AtSign } from 'lucide-react';

interface SimulatedEmailModalProps {
  email: SimulatedEmail | null;
  onClose: () => void;
}

export const SimulatedEmailModal: React.FC<SimulatedEmailModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Email Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Aviso por Correo Electrónico Simulado</h3>
              <p className="text-[11px] text-slate-400">Notificación generada automáticamente por @mención</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-2 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 w-20">De:</span>
            <span className="font-semibold text-indigo-600 flex-1">{email.remitenteNombre}</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Send className="w-3 h-3" /> Enviado
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-slate-500 w-20">Para:</span>
            <span className="text-slate-800 font-medium flex items-center gap-1">
              <AtSign className="w-3.5 h-3.5 text-slate-400" />
              {email.destinatarioNombre} ({email.destinatarioEmail})
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-slate-500 w-20">Asunto:</span>
            <span className="text-slate-900 font-bold">{email.asunto}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-slate-500 w-20">Fecha:</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(email.fecha).toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm whitespace-pre-line leading-relaxed font-sans">
            {email.contenido}
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Simulación de entrega exitosa a <strong>{email.destinatarioEmail}</strong>. El destinatario recibió alerta sonora y notificación push.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
