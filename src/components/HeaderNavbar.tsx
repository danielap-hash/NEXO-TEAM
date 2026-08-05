import React, { useState } from 'react';
import { User, NotificationItem, SimulatedEmail } from '../types';
import { 
  ClipboardPlus, PlayCircle, CheckCircle2, LayoutDashboard, MessageSquare, 
  Bell, UserCheck, Mail, Sparkles, ChevronDown, Check, UserPlus, BarChart3, Users
} from 'lucide-react';

interface HeaderNavbarProps {
  activeTab: 'cargar' | 'en_proceso' | 'finalizadas' | 'trello' | 'chat' | 'dashboard';
  setActiveTab: (tab: 'cargar' | 'en_proceso' | 'finalizadas' | 'trello' | 'chat' | 'dashboard') => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onOpenRegister: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onViewSimulatedEmail: (email: SimulatedEmail) => void;
  unreadCount: number;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenRegister,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onViewSimulatedEmail,
  unreadCount
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const tabs = [
    { id: 'cargar', label: '1. Cargar Tarea', icon: ClipboardPlus },
    { id: 'en_proceso', label: '2. En Proceso', icon: PlayCircle },
    { id: 'finalizadas', label: '3. Finalizadas', icon: CheckCircle2 },
    { id: 'trello', label: 'Tablero Trello', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Dashboard Resumen', icon: BarChart3 },
    { id: 'chat', label: 'Chat Grupal', icon: MessageSquare },
  ] as const;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-500/30">
              🤝
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Nexo Team <span className="bg-indigo-500/30 text-indigo-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">En Vivo</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Trabajo en equipo en tiempo real • Tareas • Trello • Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: User Switcher & Notifications */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowUserDropdown(false);
                }}
                className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700"
                title="Notificaciones y Avisos de Menciones @"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notif Popup */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800 animate-in fade-in duration-150">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-xs">Notificaciones & Menciones @</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-indigo-300 hover:text-white transition font-medium"
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No tienes notificaciones pendientes.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition flex flex-col gap-1.5 ${
                            n.vista ? 'bg-white opacity-80' : 'bg-indigo-50/60 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[12px]">
                              <span>{n.titulo}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-slate-700 text-xs leading-relaxed">{n.mensaje}</p>

                          <div className="flex items-center justify-between pt-1">
                            {n.emailSimulado ? (
                              <button
                                onClick={() => {
                                  onViewSimulatedEmail(n.emailSimulado!);
                                  onMarkNotificationRead(n.id);
                                  setShowNotifDropdown(false);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-100/70 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition"
                              >
                                <Mail className="w-3 h-3" /> Ver Correo Enviado
                              </button>
                            ) : (
                              <span />
                            )}

                            {!n.vista && (
                              <button
                                onClick={() => onMarkNotificationRead(n.id)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Leída
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-400"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* User Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800 p-2">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Cambiar Usuario Activo</span>
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  </div>

                  <div className="space-y-1 my-1 max-h-60 overflow-y-auto">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition ${
                          u.id === currentUser.id
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate flex items-center justify-between">
                            {u.name}
                            {u.id === currentUser.id && (
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">
                                Activo
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenRegister();
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Registrar Nuevo Usuario
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden items-center justify-between gap-1 pb-3 overflow-x-auto no-scrollbar border-t border-slate-800 pt-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
