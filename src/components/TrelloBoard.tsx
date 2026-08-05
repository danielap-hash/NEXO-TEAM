import React, { useState } from 'react';
import { TrelloCard, TrelloColumn, User, Attachment, WhiteboardElement } from '../types';
import { MentionInput } from './MentionInput';
import { FileUploader } from './FileUploader';
import { exportTrelloToExcel } from '../utils/exportToExcel';
import { 
  LayoutDashboard, Plus, MoreHorizontal, UserPlus, Paperclip, MessageSquare, 
  CheckSquare, Sparkles, X, ChevronRight, AlertOctagon, CheckCircle2, PlayCircle, 
  Clock, ShieldAlert, Palette, Move, StickyNote, Trash2, Tag, Send, Search, Filter, FileSpreadsheet
} from 'lucide-react';

interface TrelloBoardProps {
  cards: TrelloCard[];
  currentUser: User;
  allUsers: User[];
  whiteboardElements: WhiteboardElement[];
  onCreateCard: (cardData: {
    titulo: string;
    descripcion: string;
    columna: TrelloColumn;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    creador: User;
    asignados: User[];
  }) => void;
  onUpdateCard: (
    cardId: string,
    data: {
      columna?: TrelloColumn;
      titulo?: string;
      descripcion?: string;
      prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
      asignados?: User[];
      subtareas?: { id: string; texto: string; completada: boolean }[];
      nuevoComentario?: string;
      adjuntos?: Attachment[];
      usuarioAction?: User;
    }
  ) => void;
  onDeleteCard: (cardId: string) => void;
  onSaveWhiteboard: (elements: WhiteboardElement[]) => void;
}

export const TrelloBoard: React.FC<TrelloBoardProps> = ({
  cards,
  currentUser,
  allUsers,
  whiteboardElements,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onSaveWhiteboard
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'pizarra'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TrelloColumn | null>(null);

  // Filtered Cards
  const filteredCards = cards.filter(c => {
    const matchesSearch =
      c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creador.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority =
      selectedPriority === 'todas' || c.prioridad === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  // Modal State for New Card
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newColTarget, setNewColTarget] = useState<TrelloColumn>('tarea');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media');
  const [newAssignedUserIds, setNewAssignedUserIds] = useState<string[]>([currentUser.id]);

  // Selected Card for Detail Modal
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardComment, setCardComment] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Local Whiteboard State
  const [boardNotes, setBoardNotes] = useState<WhiteboardElement[]>(whiteboardElements);

  const columns: { id: TrelloColumn; label: string; icon: any; color: string; badge: string }[] = [
    { id: 'tarea', label: 'Tarea', icon: Clock, color: 'border-t-amber-500', badge: 'bg-amber-100 text-amber-800' },
    { id: 'en_proceso', label: 'En proceso', icon: PlayCircle, color: 'border-t-indigo-500', badge: 'bg-indigo-100 text-indigo-800' },
    { id: 'finalizado', label: 'Finalizado', icon: CheckCircle2, color: 'border-t-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
    { id: 'suspendido', label: 'Suspendido', icon: AlertOctagon, color: 'border-t-rose-500', badge: 'bg-rose-100 text-rose-800' }
  ];

  const priorityBadges = {
    baja: 'bg-slate-100 text-slate-700',
    media: 'bg-blue-100 text-blue-800',
    alta: 'bg-amber-100 text-amber-800 font-bold',
    urgente: 'bg-rose-100 text-rose-800 font-extrabold animate-pulse'
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedUsers = allUsers.filter(u => newAssignedUserIds.includes(u.id));

    onCreateCard({
      titulo: newTitle.trim(),
      descripcion: newDesc.trim(),
      columna: newColTarget,
      prioridad: newPriority,
      creador: currentUser,
      asignados: assignedUsers
    });

    setNewTitle('');
    setNewDesc('');
    setShowNewCardModal(false);
  };

  const activeCard = cards.find(c => c.id === selectedCardId);

  // Whiteboard Add Note
  const handleAddWhiteboardNote = () => {
    const newNote: WhiteboardElement = {
      id: `wb_${Date.now()}`,
      tipo: 'sticky',
      x: 40 + Math.random() * 200,
      y: 40 + Math.random() * 150,
      width: 220,
      height: 180,
      color: ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8'][Math.floor(Math.random() * 4)],
      contenido: '📝 Nueva nota adhesiva. Usa @correo para mencionar a un compañero...',
      autor: currentUser.name,
      actualizadoEn: new Date().toISOString()
    };
    const updated = [...boardNotes, newNote];
    setBoardNotes(updated);
    onSaveWhiteboard(updated);
  };

  const handleUpdateWhiteboardContent = (id: string, contenido: string) => {
    const updated = boardNotes.map(n => n.id === id ? { ...n, contenido } : n);
    setBoardNotes(updated);
    onSaveWhiteboard(updated);
  };

  const handleDeleteWhiteboardNote = (id: string) => {
    const updated = boardNotes.filter(n => n.id !== id);
    setBoardNotes(updated);
    onSaveWhiteboard(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Board Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/30 flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Pizarra Digital & Kanban
            </span>
            <span className="text-[11px] text-slate-400">4 Estados Estilo Trello</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Tablero de Proyectos Compartidos
          </h1>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tablero Trello</span>
          </button>

          <button
            onClick={() => setViewMode('pizarra')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'pizarra'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Pizarra Digital</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar for Trello Cards */}
      {viewMode === 'kanban' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar tarjetas por título, descripción, creador..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 outline-none w-full sm:w-auto"
              >
                <option value="todas">Todas las Prioridades</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">
              Tarjetas: <strong className="text-indigo-600 font-bold">{filteredCards.length}</strong> / {cards.length}
            </span>

            <button
              type="button"
              onClick={() => exportTrelloToExcel(filteredCards, 'Reporte_Tablero_Trello.csv')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title="Exportar tarjetas Trello a Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Tablero a Excel</span>
            </button>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-4 py-2.5 text-xs text-indigo-900 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Move className="w-4 h-4 text-indigo-600 animate-pulse" />
              <strong>Arrastrar y Soltar Habilitado:</strong> Haz clic y arrastra cualquier tarjeta para moverla entre columnas (Tarea, En Proceso, Finalizado, Suspendido) en tiempo real.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {columns.map(col => {
              const Icon = col.icon;
              const columnCards = filteredCards.filter(c => c.columna === col.id);
              const isOver = dragOverCol === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverCol !== col.id) setDragOverCol(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      if (dragOverCol === col.id) setDragOverCol(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
                    setDragOverCol(null);
                    setDraggedCardId(null);
                    if (cardId) {
                      onUpdateCard(cardId, {
                        columna: col.id,
                        usuarioAction: currentUser
                      });
                    }
                  }}
                  className={`rounded-2xl p-4 border-t-4 ${col.color} border shadow-xs flex flex-col space-y-3 min-h-[520px] transition-all duration-150 ${
                    isOver 
                      ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/50 scale-[1.01]' 
                      : 'bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-700" />
                      <h3 className="font-extrabold text-slate-800 text-sm">{col.label}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                        {columnCards.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setNewColTarget(col.id);
                        setShowNewCardModal(true);
                      }}
                      title="Agregar Tarjeta"
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
                    {columnCards.length === 0 ? (
                      <div className={`p-8 text-center text-xs border-2 border-dashed rounded-xl transition ${
                        isOver ? 'border-indigo-400 text-indigo-600 font-bold bg-indigo-50/50' : 'border-slate-200 text-slate-400'
                      }`}>
                        {isOver ? '¡Suelta la tarjeta aquí!' : 'Sin tarjetas (arrastra una tarjeta aquí)'}
                      </div>
                    ) : (
                      columnCards.map(card => {
                        const doneSubtasks = card.subtareas.filter(s => s.completada).length;
                        const isDragging = draggedCardId === card.id;

                        return (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', card.id);
                              setDraggedCardId(card.id);
                            }}
                            onDragEnd={() => {
                              setDraggedCardId(null);
                              setDragOverCol(null);
                            }}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-3 group hover:border-indigo-300 ${
                              isDragging ? 'opacity-40 border-indigo-400 ring-2 ring-indigo-400 scale-95' : 'border-slate-200/90'
                            }`}
                          >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${priorityBadges[card.prioridad]}`}>
                              {card.prioridad}
                            </span>

                            {/* Move Column Selector */}
                            <select
                              value={card.columna}
                              onClick={e => e.stopPropagation()}
                              onChange={e => {
                                e.stopPropagation();
                                onUpdateCard(card.id, {
                                  columna: e.target.value as TrelloColumn,
                                  usuarioAction: currentUser
                                });
                              }}
                              className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 outline-none hover:bg-slate-100"
                            >
                              <option value="tarea">Mover a Tarea</option>
                              <option value="en_proceso">Mover a En proceso</option>
                              <option value="finalizado">Mover a Finalizado</option>
                              <option value="suspendido">Mover a Suspendido</option>
                            </select>
                          </div>

                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-indigo-600 transition">
                            {card.titulo}
                          </h4>

                          {card.descripcion && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
                              {card.descripcion}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {card.subtareas.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <CheckSquare className="w-3 h-3 text-indigo-500" />
                              <span>{doneSubtasks}/{card.subtareas.length} Subtareas</span>
                            </div>
                          )}

                          {/* Card Footer: Assignees & Comment counts */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                            <div className="flex items-center -space-x-1.5">
                              {card.asignados && card.asignados.map(a => (
                                <img
                                  key={a.id}
                                  src={a.avatar}
                                  alt={a.name}
                                  title={a.name}
                                  className="w-5 h-5 rounded-full object-cover border border-white"
                                />
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              {card.adjuntos.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <Paperclip className="w-3 h-3" /> {card.adjuntos.length}
                                </span>
                              )}
                              {card.comentarios.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-500">
                                  <MessageSquare className="w-3 h-3 text-indigo-500" /> {card.comentarios.length}
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Add Card Link */}
                <button
                  type="button"
                  onClick={() => {
                    setNewColTarget(col.id);
                    setShowNewCardModal(true);
                  }}
                  className="w-full py-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs border border-dashed border-indigo-200 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar tarjeta</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* PIZARRA DIGITAL INTERACTIVA VIEW */}
      {viewMode === 'pizarra' && (
        <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-6 min-h-[550px] relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-slate-800 text-sm">
                Canvas Digital Interactivo de Notas Adhesivas
              </h2>
            </div>
            <button
              onClick={handleAddWhiteboardNote}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agregar Nota Adhesiva
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Puedes escribir ideas, diagramar o mencionar a compañeros con <span className="font-bold text-indigo-600">@correo</span> en las notas adhesivas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {boardNotes.map(note => (
              <div
                key={note.id}
                style={{ backgroundColor: note.color }}
                className="rounded-2xl p-4 shadow-md border border-black/10 flex flex-col justify-between space-y-3 relative group transition hover:scale-102"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700/80 border-b border-black/10 pb-1.5">
                  <span className="flex items-center gap-1">
                    <StickyNote className="w-3.5 h-3.5" /> Autor: {note.autor}
                  </span>
                  <button
                    onClick={() => handleDeleteWhiteboardNote(note.id)}
                    className="p-1 hover:bg-red-500/20 rounded text-rose-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <MentionInput
                  value={note.contenido}
                  onChange={val => handleUpdateWhiteboardContent(note.id, val)}
                  users={allUsers}
                  multiline
                  rows={4}
                  className="bg-transparent border-none focus:ring-0 text-slate-900 font-semibold text-xs leading-relaxed"
                />

                <div className="text-[10px] text-slate-600/70 text-right italic font-mono">
                  {new Date(note.actualizadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE CARD MODAL */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Nueva Tarjeta Trello</h3>
              <button onClick={() => setShowNewCardModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCardSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Título de la Tarjeta</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ej. Revisión de OC con departamento contable"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Columna Destino</label>
                <select
                  value={newColTarget}
                  onChange={e => setNewColTarget(e.target.value as TrelloColumn)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="tarea">Tarea</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Descripción (Usa @ para mencionar compañeros)
                </label>
                <MentionInput
                  value={newDesc}
                  onChange={setNewDesc}
                  users={allUsers}
                  multiline
                  rows={3}
                  placeholder="Detalles de la tarjeta..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  Crear Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CARD DETAIL / EDIT MODAL */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  Columna: {columns.find(c => c.id === activeCard.columna)?.label}
                </span>
                <h3 className="font-extrabold text-base text-white">{activeCard.titulo}</h3>
              </div>
              <button
                onClick={() => setSelectedCardId(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-800">
              
              {/* Description */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Descripción y Menciones @:</label>
                <MentionInput
                  value={activeCard.descripcion}
                  onChange={val => onUpdateCard(activeCard.id, { descripcion: val, usuarioAction: currentUser })}
                  users={allUsers}
                  multiline
                  rows={3}
                />
              </div>

              {/* Priority & Column Switcher */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mover a Columna:</label>
                  <select
                    value={activeCard.columna}
                    onChange={e => onUpdateCard(activeCard.id, { columna: e.target.value as any, usuarioAction: currentUser })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="tarea">Tarea</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridad:</label>
                  <select
                    value={activeCard.prioridad}
                    onChange={e => onUpdateCard(activeCard.id, { prioridad: e.target.value as any, usuarioAction: currentUser })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block flex items-center justify-between">
                  <span>Lista de Subtareas:</span>
                  <span className="text-[10px] text-slate-400">
                    {activeCard.subtareas.filter(s => s.completada).length}/{activeCard.subtareas.length} completadas
                  </span>
                </label>

                <div className="space-y-1">
                  {activeCard.subtareas.map(st => (
                    <div key={st.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={st.completada}
                        onChange={e => {
                          const updated = activeCard.subtareas.map(s => s.id === st.id ? { ...s, completada: e.target.checked } : s);
                          onUpdateCard(activeCard.id, { subtareas: updated, usuarioAction: currentUser });
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className={`text-xs ${st.completada ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                        {st.texto}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Subtask input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={e => setNewSubtaskText(e.target.value)}
                    placeholder="Añadir subtarea..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSubtaskText.trim()) return;
                      const newSub = { id: `sub_${Date.now()}`, texto: newSubtaskText.trim(), completada: false };
                      onUpdateCard(activeCard.id, { subtareas: [...activeCard.subtareas, newSub], usuarioAction: currentUser });
                      setNewSubtaskText('');
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Archivos Adjuntos:</label>
                <FileUploader
                  attachments={activeCard.adjuntos}
                  onAddAttachment={att => onUpdateCard(activeCard.id, { adjuntos: [...activeCard.adjuntos, att], usuarioAction: currentUser })}
                  onRemoveAttachment={id => onUpdateCard(activeCard.id, { adjuntos: activeCard.adjuntos.filter(a => a.id !== id), usuarioAction: currentUser })}
                />
              </div>

              {/* Comments Stream */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs">Comentarios & Menciones @:</h4>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeCard.comentarios.length === 0 ? (
                    <p className="text-slate-400 italic text-[11px]">No hay comentarios aún.</p>
                  ) : (
                    activeCard.comentarios.map(c => (
                      <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{c.usuario.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700">{c.contenido}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MentionInput
                    value={cardComment}
                    onChange={setCardComment}
                    users={allUsers}
                    placeholder="Escribe un comentario o usa @correo..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!cardComment.trim()) return;
                      onUpdateCard(activeCard.id, { nuevoComentario: cardComment.trim(), usuarioAction: currentUser });
                      setCardComment('');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shrink-0"
                  >
                    Enviar
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onDeleteCard(activeCard.id);
                  setSelectedCardId(null);
                }}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl transition text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar Tarjeta
              </button>

              <button
                type="button"
                onClick={() => setSelectedCardId(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Listo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
