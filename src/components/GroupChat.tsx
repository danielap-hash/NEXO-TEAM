import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User, Attachment } from '../types';
import { MentionInput } from './MentionInput';
import { FileUploader } from './FileUploader';
import { 
  MessageSquare, Send, Paperclip, Sparkles, UserCheck, AtSign, 
  ArrowUpRight, FileText, LayoutDashboard, Radio
} from 'lucide-react';

interface GroupChatProps {
  messages: ChatMessage[];
  currentUser: User;
  allUsers: User[];
  onSendMessage: (texto: string, adjuntos?: Attachment[]) => void;
  onNavigateToReference?: (tipo: 'stage_task' | 'trello_card', id: string) => void;
}

export const GroupChat: React.FC<GroupChatProps> = ({
  messages,
  currentUser,
  allUsers,
  onSendMessage,
  onNavigateToReference
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[680px] animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2">
              Chat Grupal & Canal de Actividad
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Interacción en tiempo real • Menciones con <span className="text-indigo-300 font-mono">@correo</span>
            </p>
          </div>
        </div>

        {/* Active Online Avatars */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold text-[11px]">En línea:</span>
          <div className="flex -space-x-2">
            {allUsers.map(u => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={`${u.name} (${u.email})`}
                className="w-6 h-6 rounded-full object-cover border border-slate-900 ring-1 ring-emerald-400"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No hay mensajes en el chat. ¡Inicia la conversación o menciona a alguien con @!
          </div>
        ) : (
          messages.slice().reverse().map(msg => {
            const isMe = msg.usuario.id === currentUser.id;
            const isSys = msg.esSistema;

            if (isSys) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2 rounded-2xl text-xs font-semibold shadow-xs flex items-center gap-2 max-w-lg">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{msg.texto}</span>
                    {msg.tipoReferencia && msg.idReferencia && onNavigateToReference && (
                      <button
                        onClick={() => onNavigateToReference(msg.tipoReferencia!, msg.idReferencia!)}
                        className="p-1 bg-indigo-200/60 hover:bg-indigo-200 rounded-lg text-indigo-800 transition text-[10px] font-bold flex items-center gap-0.5 ml-1"
                      >
                        Ver <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <img
                  src={msg.usuario.avatar}
                  alt={msg.usuario.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-1"
                />

                <div className={`space-y-1.5 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-800">{msg.usuario.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.texto}</p>

                    {/* Reference Badges */}
                    {msg.tipoReferencia && msg.idReferencia && (
                      <div className={`mt-2 p-2 rounded-xl text-[11px] font-bold flex items-center justify-between border ${
                        isMe ? 'bg-indigo-700 border-indigo-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}>
                        <span className="flex items-center gap-1">
                          {msg.tipoReferencia === 'stage_task' ? <FileText className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                          Ref: {msg.tituloReferencia || 'Ver elemento'}
                        </span>
                        {onNavigateToReference && (
                          <button
                            onClick={() => onNavigateToReference(msg.tipoReferencia!, msg.idReferencia!)}
                            className="underline hover:opacity-80"
                          >
                            Ir a {msg.tipoReferencia === 'stage_task' ? 'Tarea' : 'Trello'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Message Attachments */}
                    {msg.adjuntos && msg.adjuntos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <FileUploader
                          attachments={msg.adjuntos}
                          onAddAttachment={() => {}}
                          onRemoveAttachment={() => {}}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 space-y-3">
        {attachments.length > 0 && (
          <FileUploader
            attachments={attachments}
            onAddAttachment={att => setAttachments([...attachments, att])}
            onRemoveAttachment={id => setAttachments(attachments.filter(a => a.id !== id))}
          />
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MentionInput
              value={inputText}
              onChange={setInputText}
              users={allUsers}
              placeholder="Escribe un mensaje o menciona a alguien con @correo..."
            />
          </div>

          <FileUploader
            attachments={[]}
            onAddAttachment={att => setAttachments([...attachments, att])}
            onRemoveAttachment={() => {}}
          />

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 shrink-0 cursor-pointer text-xs"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
};
