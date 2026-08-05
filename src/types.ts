export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  online: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // mime type or category
  url: string;  // data url or link
  createdAt: string;
}

export type TaskStage = 'pendiente' | 'en_proceso' | 'finalizado';

export interface Comment {
  id: string;
  usuario: User;
  contenido: string;
  fecha: string;
  menciones: string[]; // array of emails
}

export interface StageTaskHistory {
  fecha: string;
  estado: string;
  usuarioName: string;
  notas?: string;
}

export interface StageTask {
  id: string;
  fecha: string; // Fecha de la tarea
  tarea: string; // Nombre / Encabezado
  observacion: string; // Observaciones
  adjuntos: Attachment[];
  usuarioCreador: User;
  usuarioAsignado?: User;
  usuariosAsignados?: User[];
  stage: TaskStage;
  estadoDetalle?: string; // e.g., "Alta", "En manos del proveedor", "Códigos Suspendidos", "OC Pendiente", "Finalizar"
  historialEstados: StageTaskHistory[];
  comentarios: Comment[];
  menciones: string[];
  createdAt: string;
  updatedAt: string;
}

export type TrelloColumn = 'tarea' | 'en_proceso' | 'finalizado' | 'suspendido';

export interface SubTask {
  id: string;
  texto: string;
  completada: boolean;
}

export interface TrelloCard {
  id: string;
  titulo: string;
  descripcion: string;
  columna: TrelloColumn;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  adjuntos: Attachment[];
  asignados: User[];
  creador: User;
  comentarios: Comment[];
  subtareas: SubTask[];
  menciones: string[];
  posicion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  usuario: User;
  texto: string;
  adjuntos?: Attachment[];
  fecha: string;
  esSistema?: boolean;
  tipoReferencia?: 'stage_task' | 'trello_card';
  idReferencia?: string;
  tituloReferencia?: string;
  menciones?: string[];
}

export interface SimulatedEmail {
  id: string;
  destinatarioEmail: string;
  destinatarioNombre: string;
  remitenteNombre: string;
  asunto: string;
  contenido: string;
  fecha: string;
  origen: string; // e.g. "Chat", "Tarea", "Tablero Trello"
}

export interface NotificationItem {
  id: string;
  usuarioEmail: string;
  deUsuario: User;
  titulo: string;
  mensaje: string;
  tipo: 'mencion' | 'tarea' | 'trello' | 'chat';
  idReferencia?: string;
  vista: boolean;
  fecha: string;
  emailSimulado?: SimulatedEmail;
}

export interface WhiteboardElement {
  id: string;
  tipo: 'sticky' | 'card' | 'text' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  contenido: string;
  autor: string;
  actualizadoEn: string;
}
