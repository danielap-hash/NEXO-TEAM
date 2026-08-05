import React, { useState, useEffect } from 'react';
import { 
  User, StageTask, TrelloCard, ChatMessage, NotificationItem, SimulatedEmail, 
  Attachment, TrelloColumn, WhiteboardElement 
} from './types';
import { HeaderNavbar } from './components/HeaderNavbar';
import { UserAuthModal } from './components/UserAuthModal';
import { SimulatedEmailModal } from './components/SimulatedEmailModal';
import { TaskCreatePage } from './components/TaskCreatePage';
import { TaskInProgressPage } from './components/TaskInProgressPage';
import { TaskCompletedPage } from './components/TaskCompletedPage';
import { TrelloBoard } from './components/TrelloBoard';
import { GroupChat } from './components/GroupChat';
import { DashboardSummaryPage } from './components/DashboardSummaryPage';
import { Sparkles, MessageSquare, Bell, Mail, X } from 'lucide-react';

export default function App() {
  // Navigation active view tab
  const [activeTab, setActiveTab] = useState<'cargar' | 'en_proceso' | 'finalizadas' | 'trello' | 'chat' | 'dashboard'>('cargar');
  const [dismissedMentionNotifId, setDismissedMentionNotifId] = useState<string | null>(null);

  // Application Data States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stageTasks, setStageTasks] = useState<StageTask[]>([]);
  const [trelloCards, setTrelloCards] = useState<TrelloCard[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeSimulatedEmail, setActiveSimulatedEmail] = useState<SimulatedEmail | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const [uRes, tRes, trRes, cRes, nRes, wRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/trello').then(r => r.json()),
        fetch('/api/chat').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/whiteboard').then(r => r.json())
      ]);

      setAllUsers(uRes);
      if (!currentUser && uRes.length > 0) {
        setCurrentUser(uRes[0]);
      }
      setStageTasks(tRes);
      setTrelloCards(trRes);
      setChatMessages(cRes);
      setNotifications(nRes);
      setWhiteboardElements(wRes);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time Server-Sent Events (SSE)
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'tasks_updated') {
          setStageTasks(data.payload);
        } else if (data.type === 'trello_updated') {
          setTrelloCards(data.payload);
        } else if (data.type === 'chat_updated') {
          setChatMessages(data.payload);
        } else if (data.type === 'notifications_updated') {
          setNotifications(data.payload);
        } else if (data.type === 'users_updated') {
          setAllUsers(data.payload);
        } else if (data.type === 'whiteboard_updated') {
          setWhiteboardElements(data.payload);
        }
      } catch (err) {
        console.error('Error en SSE:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <p className="text-sm font-semibold">Cargando CollabTask...</p>
        </div>
      </div>
    );
  }

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    n => n.usuarioEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const unreadCount = userNotifications.filter(n => !n.vista).length;
  const latestMentionNotif = userNotifications.find(
    n => !n.vista && n.emailSimulado && n.id !== dismissedMentionNotifId
  );

  // Actions
  const handleRegisterUser = async (userData: { name: string; email: string; role: string; department: string; avatar?: string }) => {
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const newU = await res.json();
      setCurrentUser(newU);
      fetchData();
    } catch (err) {
      console.error('Error registrando usuario:', err);
    }
  };

  const handleCreateStageTask = async (taskData: {
    fecha: string;
    tarea: string;
    observacion: string;
    adjuntos: Attachment[];
    usuarioCreador: User;
    usuarioAsignado?: User;
  }) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
    } catch (err) {
      console.error('Error al crear tarea:', err);
    }
  };

  const handleStartWorkingTask = async (task: StageTask) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'en_proceso',
          estadoDetalle: 'Alta',
          usuarioAction: currentUser,
          notasEstado: 'Se inició el trabajo de la tarea.'
        })
      });
      setActiveTab('en_proceso');
    } catch (err) {
      console.error('Error al empezar trabajo:', err);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    estadoDetalle: string,
    notasEstado: string,
    stage?: 'en_proceso' | 'finalizado',
    nuevoComentario?: string,
    adjuntos?: Attachment[]
  ) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          estadoDetalle,
          notasEstado,
          usuarioAction: currentUser,
          nuevoComentario,
          adjuntos
        })
      });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleFinishTask = async (task: StageTask) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'finalizado',
          estadoDetalle: 'Finalizar',
          usuarioAction: currentUser,
          notasEstado: 'Tarea completada satisfactoriamente.'
        })
      });
      setActiveTab('finalizadas');
    } catch (err) {
      console.error('Error al finalizar tarea:', err);
    }
  };

  const handleReopenTask = async (task: StageTask) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'en_proceso',
          estadoDetalle: 'Alta',
          usuarioAction: currentUser,
          notasEstado: 'Tarea reabierta.'
        })
      });
      setActiveTab('en_proceso');
    } catch (err) {
      console.error('Error reabriendo tarea:', err);
    }
  };

  const handleCreateTrelloCard = async (cardData: {
    titulo: string;
    descripcion: string;
    columna: TrelloColumn;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    creador: User;
    asignados: User[];
  }) => {
    try {
      await fetch('/api/trello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
    } catch (err) {
      console.error('Error al crear tarjeta Trello:', err);
    }
  };

  const handleUpdateTrelloCard = async (cardId: string, data: any) => {
    try {
      await fetch(`/api/trello/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Error al actualizar tarjeta Trello:', err);
    }
  };

  const handleDeleteTrelloCard = async (cardId: string) => {
    try {
      await fetch(`/api/trello/${cardId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error eliminando tarjeta:', err);
    }
  };

  const handleSendMessage = async (texto: string, adjuntos?: Attachment[]) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: currentUser,
          texto,
          adjuntos
        })
      });
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWhiteboard = async (elements: WhiteboardElement[]) => {
    try {
      await fetch('/api/whiteboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* Top Navbar */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={setCurrentUser}
        onOpenRegister={() => setShowRegisterModal(true)}
        notifications={userNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onViewSimulatedEmail={setActiveSimulatedEmail}
        unreadCount={unreadCount}
      />

      {/* Top Email Mention Alert Banner */}
      {latestMentionNotif && (
        <div className="bg-indigo-900 text-white border-b border-indigo-700 px-4 py-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-indigo-200 animate-bounce" />
              </div>
              <div>
                <span className="font-extrabold text-indigo-200">📧 ¡Aviso de Mención por Email Recibido!</span>
                <p className="text-slate-200">
                  <strong>{latestMentionNotif.deUsuario.name}</strong> te ha mencionado en <strong>{latestMentionNotif.emailSimulado?.origen}</strong>: "{latestMentionNotif.mensaje}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (latestMentionNotif.emailSimulado) {
                    setActiveSimulatedEmail(latestMentionNotif.emailSimulado);
                  }
                }}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Ver Correo Notificado</span>
              </button>
              <button
                onClick={() => {
                  setDismissedMentionNotifId(latestMentionNotif.id);
                  handleMarkNotificationRead(latestMentionNotif.id);
                }}
                className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-800 transition cursor-pointer"
                title="Descartar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'cargar' && (
          <TaskCreatePage
            tasks={stageTasks}
            currentUser={currentUser}
            allUsers={allUsers}
            onCreateTask={handleCreateStageTask}
            onStartWorkingTask={handleStartWorkingTask}
            onViewTaskDetail={() => setActiveTab('en_proceso')}
          />
        )}

        {activeTab === 'en_proceso' && (
          <TaskInProgressPage
            tasks={stageTasks}
            currentUser={currentUser}
            allUsers={allUsers}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onFinishTask={handleFinishTask}
          />
        )}

        {activeTab === 'finalizadas' && (
          <TaskCompletedPage
            tasks={stageTasks}
            onReopenTask={handleReopenTask}
          />
        )}

        {activeTab === 'trello' && (
          <TrelloBoard
            cards={trelloCards}
            currentUser={currentUser}
            allUsers={allUsers}
            whiteboardElements={whiteboardElements}
            onCreateCard={handleCreateTrelloCard}
            onUpdateCard={handleUpdateTrelloCard}
            onDeleteCard={handleDeleteTrelloCard}
            onSaveWhiteboard={handleSaveWhiteboard}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardSummaryPage
            tasks={stageTasks}
            cards={trelloCards}
            users={allUsers}
            chatMessages={chatMessages}
            notifications={notifications}
          />
        )}

        {activeTab === 'chat' && (
          <GroupChat
            messages={chatMessages}
            currentUser={currentUser}
            allUsers={allUsers}
            onSendMessage={handleSendMessage}
            onNavigateToReference={(tipo) => {
              if (tipo === 'stage_task') setActiveTab('en_proceso');
              else if (tipo === 'trello_card') setActiveTab('trello');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center space-y-1">
        <p className="font-semibold text-slate-300">
          🤝 Nexo Team — Entorno Colaborativo de Trabajo en Equipo
        </p>
        <p className="text-[11px] text-slate-500">
          Carga de Tareas • Multi-Asignación • Flujo en Proceso • Drag & Drop Kanban • Dashboard Resumen • Chat Grupal • Menciones @
        </p>
      </footer>

      {/* Modals */}
      <UserAuthModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={handleRegisterUser}
      />

      <SimulatedEmailModal
        email={activeSimulatedEmail}
        onClose={() => setActiveSimulatedEmail(null)}
      />

    </div>
  );
}
