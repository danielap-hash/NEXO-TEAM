import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  User, StageTask, TrelloCard, ChatMessage, NotificationItem, SimulatedEmail, WhiteboardElement 
} from './src/types.js';

const app = express();
const PORT = 3000;

// Increase body payload limit for image / file uploads in base64
app.use(express.json({ limit: '25mb' }));

// Initial Mock Users
let users: User[] = [
  {
    id: 'usr_1',
    name: 'Daniela Perez',
    email: 'dinosaurio.danielap@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Líder de Proyecto',
    department: 'Operaciones',
    online: true,
  },
  {
    id: 'usr_2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Coordinador de Proveedores',
    department: 'Logística',
    online: true,
  },
  {
    id: 'usr_3',
    name: 'Sofia Ramirez',
    email: 'sofia.ramirez@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Analista de Compras',
    department: 'Finanzas',
    online: false,
  },
  {
    id: 'usr_4',
    name: 'Mateo Rossi',
    email: 'mateo.rossi@empresa.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Supervisora de Calidad',
    department: 'Sistemas',
    online: true,
  },
];

// Initial Stage Tasks
let stageTasks: StageTask[] = [
  {
    id: 'st_101',
    fecha: new Date().toISOString().split('T')[0],
    tarea: 'Auditoría de códigos de insumos industriales',
    observacion: 'Se solicita revisar con @carlos.mendoza@empresa.com los códigos retenidos en la orden de compra #8841.',
    adjuntos: [
      {
        id: 'att_1',
        name: 'Reporte_Codigos_Insumos.pdf',
        size: 245000,
        type: 'application/pdf',
        url: 'data:text/plain;base64,U3Vwb3J0ZWQgRG9jdW1lbnQ=',
        createdAt: new Date().toISOString()
      }
    ],
    usuarioCreador: users[0],
    usuarioAsignado: users[1],
    stage: 'pendiente',
    estadoDetalle: 'Alta',
    historialEstados: [
      {
        fecha: new Date().toISOString(),
        estado: 'Cargada',
        usuarioName: users[0].name,
        notas: 'Tarea ingresada al sistema.'
      }
    ],
    comentarios: [],
    menciones: ['carlos.mendoza@empresa.com'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'st_102',
    fecha: new Date().toISOString().split('T')[0],
    tarea: 'Negociación de entrega especial con Proveedor Metalúrgica',
    observacion: 'Pendiente de confirmación de fecha de despacho. Contactar a la ejecutiva @sofia.ramirez@empresa.com',
    adjuntos: [],
    usuarioCreador: users[1],
    usuarioAsignado: users[2],
    stage: 'en_proceso',
    estadoDetalle: 'En manos del proveedor',
    historialEstados: [
      {
        fecha: new Date(Date.now() - 3600000 * 12).toISOString(),
        estado: 'Cargada',
        usuarioName: users[1].name
      },
      {
        fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
        estado: 'En manos del proveedor',
        usuarioName: users[1].name,
        notas: 'Se envió presupuesto firmado al proveedor.'
      }
    ],
    comentarios: [
      {
        id: 'c_1',
        usuario: users[2],
        contenido: 'El proveedor respondió que el martes despacha el lote inicial. Atenta @dinosaurio.danielap@gmail.com',
        fecha: new Date(Date.now() - 3600000).toISOString(),
        menciones: ['dinosaurio.danielap@gmail.com']
      }
    ],
    menciones: ['sofia.ramirez@empresa.com', 'dinosaurio.danielap@gmail.com'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'st_103',
    fecha: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    tarea: 'Aprobación de Orden de Compra OC-99201',
    observacion: 'Completada la validación de montos por finanzas y firma digital.',
    adjuntos: [],
    usuarioCreador: users[2],
    usuarioAsignado: users[0],
    stage: 'finalizado',
    estadoDetalle: 'Finalizar',
    historialEstados: [
      {
        fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
        estado: 'Cargada',
        usuarioName: users[2].name
      },
      {
        fecha: new Date(Date.now() - 86400000).toISOString(),
        estado: 'OC Pendiente',
        usuarioName: users[0].name
      },
      {
        fecha: new Date(Date.now() - 18000000).toISOString(),
        estado: 'Finalizado',
        usuarioName: users[0].name,
        notas: 'Orden emitida y cargada a ERP.'
      }
    ],
    comentarios: [],
    menciones: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
  }
];

// Initial Trello Cards
let trelloCards: TrelloCard[] = [
  {
    id: 'tr_1',
    titulo: 'Integración de módulo de facturación electrónica',
    descripcion: 'Revisar API de AFIP/Servicio local. Mencionar a @mateo.rossi@empresa.com para validación de tokens.',
    columna: 'tarea',
    prioridad: 'alta',
    adjuntos: [],
    asignados: [users[3]],
    creador: users[0],
    comentarios: [],
    subtareas: [
      { id: 'sub_1', texto: 'Configurar certificados SSL', completada: true },
      { id: 'sub_2', texto: 'Pruebas de Webhook', completada: false }
    ],
    menciones: ['mateo.rossi@empresa.com'],
    posicion: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tr_2',
    titulo: 'Restructuración de inventario de repuestos',
    descripcion: 'Alineación de SKU con el nuevo catálogo. @carlos.mendoza@empresa.com coordinará la carga.',
    columna: 'en_proceso',
    prioridad: 'urgente',
    adjuntos: [],
    asignados: [users[1], users[2]],
    creador: users[1],
    comentarios: [
      {
        id: 'tc_1',
        usuario: users[1],
        contenido: 'Avanzamos un 60% en la categorización de tornillos y válvulas.',
        fecha: new Date(Date.now() - 1200000).toISOString(),
        menciones: []
      }
    ],
    subtareas: [
      { id: 'sub_3', texto: 'Conteo físico depósito B', completada: true },
      { id: 'sub_4', texto: 'Actualización en sistema central', completada: false }
    ],
    menciones: ['carlos.mendoza@empresa.com'],
    posicion: 0,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'tr_3',
    titulo: 'Mantenimiento preventivo Servidor Principal',
    descripcion: 'Tareas suspendidas temporalmente por corte programado de energía.',
    columna: 'suspendido',
    prioridad: 'media',
    adjuntos: [],
    asignados: [users[3]],
    creador: users[3],
    comentarios: [],
    subtareas: [],
    menciones: [],
    posicion: 0,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'tr_4',
    titulo: 'Capacitación del equipo sobre nuevo protocolo de tareas',
    descripcion: 'Se realizó la sesión vía Meet con asistencia completa del equipo.',
    columna: 'finalizado',
    prioridad: 'baja',
    adjuntos: [],
    asignados: [users[0], users[1], users[2], users[3]],
    creador: users[0],
    comentarios: [],
    subtareas: [
      { id: 'sub_5', texto: 'Enviar grabación por correo', completada: true }
    ],
    menciones: [],
    posicion: 0,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 100000000).toISOString()
  }
];

// Initial Chat Messages
let chatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    usuario: users[0],
    texto: '¡Bienvenidos al espacio colaborativo! Recuerden que pueden usar @ para mencionar a cualquier compañero.',
    fecha: new Date(Date.now() - 14400000).toISOString(),
    menciones: []
  },
  {
    id: 'msg_2',
    usuario: users[1],
    texto: 'Hola equipo. Cargué la tarea de auditoría de códigos en la sección de "Cargar Tarea". @dinosaurio.danielap@gmail.com por favor revísala cuando puedas.',
    fecha: new Date(Date.now() - 10800000).toISOString(),
    menciones: ['dinosaurio.danielap@gmail.com'],
    tipoReferencia: 'stage_task',
    idReferencia: 'st_101',
    tituloReferencia: 'Auditoría de códigos de insumos industriales'
  },
  {
    id: 'msg_3',
    usuario: users[3],
    texto: 'Actualicé el tablero Trello con la integración de facturación electrónica. ¡Quedo atento!',
    fecha: new Date(Date.now() - 3600000).toISOString(),
    menciones: [],
    tipoReferencia: 'trello_card',
    idReferencia: 'tr_1',
    tituloReferencia: 'Integración de módulo de facturación electrónica'
  }
];

// Initial Notifications
let notifications: NotificationItem[] = [
  {
    id: 'notif_1',
    usuarioEmail: 'dinosaurio.danielap@gmail.com',
    deUsuario: users[1],
    titulo: 'Te mencionaron en el Chat Grupal',
    mensaje: 'Carlos Mendoza te mencionó: "@dinosaurio.danielap@gmail.com por favor revísala cuando puedas."',
    tipo: 'chat',
    idReferencia: 'msg_2',
    vista: false,
    fecha: new Date(Date.now() - 10800000).toISOString(),
    emailSimulado: {
      id: 'em_1',
      destinatarioEmail: 'dinosaurio.danielap@gmail.com',
      destinatarioNombre: 'Daniela Perez',
      remitenteNombre: 'Carlos Mendoza',
      asunto: '🔔 Te han mencionado en CollabTask',
      contenido: 'Hola Daniela Perez,\n\nCarlos Mendoza te ha mencionado en un mensaje del Chat Grupal:\n\n"Cargué la tarea de auditoría de códigos... @dinosaurio.danielap@gmail.com por favor revísala cuando puedas."\n\nPuedes ver el detalle ingresando a la aplicación.',
      fecha: new Date(Date.now() - 10800000).toISOString(),
      origen: 'Chat Grupal'
    }
  }
];

// Initial Whiteboard Elements
let whiteboardElements: WhiteboardElement[] = [
  {
    id: 'wb_1',
    tipo: 'sticky',
    x: 80,
    y: 100,
    width: 220,
    height: 180,
    color: '#fef08a', // yellow
    contenido: '💡 Propuesta: Automatizar alerta de OC Pendiente cuando pasen 48hs sin respuesta del proveedor.',
    autor: 'Daniela Perez',
    actualizadoEn: new Date().toISOString()
  },
  {
    id: 'wb_2',
    tipo: 'sticky',
    x: 340,
    y: 100,
    width: 220,
    height: 180,
    color: '#bae6fd', // blue
    contenido: '📌 Revisión semanal de Códigos Suspendidos todos los viernes a las 11:00 AM.',
    autor: 'Carlos Mendoza',
    actualizadoEn: new Date().toISOString()
  }
];

// SSE Event Stream Subscription Management
let sseClients: { id: string; res: express.Response }[] = [];

function broadcastUpdate(type: string, payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Helper to detect @mentions in text and trigger notifications / emails
function processMentions(text: string, sender: User, contextTitle: string, itemType: 'chat' | 'tarea' | 'trello', itemId: string) {
  const emailRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const usernameRegex = /@([a-zA-Z0-9._%+-]+)/g;

  const foundEmails: string[] = [];
  let match;

  while ((match = emailRegex.exec(text)) !== null) {
    foundEmails.push(match[1].toLowerCase());
  }

  // Also match user names if email wasn't typed directly
  while ((match = usernameRegex.exec(text)) !== null) {
    const term = match[1].toLowerCase();
    users.forEach(u => {
      if (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)) {
        if (!foundEmails.includes(u.email.toLowerCase())) {
          foundEmails.push(u.email.toLowerCase());
        }
      }
    });
  }

  foundEmails.forEach(recipientEmail => {
    const targetUser = users.find(u => u.email.toLowerCase() === recipientEmail);
    const targetName = targetUser ? targetUser.name : recipientEmail;

    const emailSimulated: SimulatedEmail = {
      id: `em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      destinatarioEmail: recipientEmail,
      destinatarioNombre: targetName,
      remitenteNombre: sender.name,
      asunto: `📧 [Aviso] Mención de ${sender.name} en ${contextTitle}`,
      contenido: `Hola ${targetName},\n\n${sender.name} te ha mencionado en ${contextTitle}:\n\n"${text}"\n\nIngresa al sistema para responder o colaborar en tiempo real.`,
      fecha: new Date().toISOString(),
      origen: contextTitle
    };

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      usuarioEmail: recipientEmail,
      deUsuario: sender,
      titulo: `Te mencionaron en ${contextTitle}`,
      mensaje: `${sender.name}: "${text.length > 80 ? text.substring(0, 80) + '...' : text}"`,
      tipo: itemType,
      idReferencia: itemId,
      vista: false,
      fecha: new Date().toISOString(),
      emailSimulado: emailSimulated
    };

    notifications.unshift(newNotif);
  });

  if (foundEmails.length > 0) {
    broadcastUpdate('notifications_updated', notifications);
  }

  return foundEmails;
}

// SSE Connection Endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Users Routes
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/register', (req, res) => {
  const { name, email, role, department, avatar } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y Email son requeridos' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.name = name;
    if (role) existing.role = role;
    if (department) existing.department = department;
    if (avatar) existing.avatar = avatar;
    existing.online = true;
    broadcastUpdate('users_updated', users);
    return res.json(existing);
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    role: role || 'Colaborador',
    department: department || 'General',
    online: true
  };

  users.push(newUser);
  broadcastUpdate('users_updated', users);
  res.status(201).json(newUser);
});

// Stage Tasks Routes
app.get('/api/tasks', (req, res) => {
  res.json(stageTasks);
});

app.post('/api/tasks', (req, res) => {
  const { fecha, tarea, observacion, adjuntos, usuarioCreador, usuarioAsignado } = req.body;

  if (!tarea || !usuarioCreador) {
    return res.status(400).json({ error: 'Título de tarea y usuario creador son obligatorios' });
  }

  const newTask: StageTask = {
    id: `st_${Date.now()}`,
    fecha: fecha || new Date().toISOString().split('T')[0],
    tarea,
    observacion: observacion || '',
    adjuntos: adjuntos || [],
    usuarioCreador,
    usuarioAsignado,
    stage: 'pendiente',
    estadoDetalle: 'Alta',
    historialEstados: [
      {
        fecha: new Date().toISOString(),
        estado: 'Cargada (Pendiente)',
        usuarioName: usuarioCreador.name,
        notas: 'Tarea registrada en el sistema.'
      }
    ],
    comentarios: [],
    menciones: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mentions = processMentions(observacion || '', usuarioCreador, `Tarea: ${tarea}`, 'tarea', newTask.id);
  newTask.menciones = mentions;

  stageTasks.unshift(newTask);

  // Auto-post system notice in chat
  const sysMsg: ChatMessage = {
    id: `sys_${Date.now()}`,
    usuario: usuarioCreador,
    texto: `📌 Nueva tarea cargada: "${tarea}" por ${usuarioCreador.name}`,
    fecha: new Date().toISOString(),
    esSistema: true,
    tipoReferencia: 'stage_task',
    idReferencia: newTask.id,
    tituloReferencia: tarea
  };
  chatMessages.unshift(sysMsg);

  broadcastUpdate('tasks_updated', stageTasks);
  broadcastUpdate('chat_updated', chatMessages);

  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { stage, estadoDetalle, notasEstado, usuarioAction, observacion, adjuntos, nuevoComentario } = req.body;

  const taskIndex = stageTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const task = stageTasks[taskIndex];
  const oldStage = task.stage;

  if (stage && stage !== task.stage) {
    task.stage = stage;
  }

  if (estadoDetalle) {
    task.estadoDetalle = estadoDetalle;
  }

  if (observacion !== undefined) {
    task.observacion = observacion;
    if (usuarioAction) {
      const mentions = processMentions(observacion, usuarioAction, `Tarea: ${task.tarea}`, 'tarea', task.id);
      task.menciones = Array.from(new Set([...task.menciones, ...mentions]));
    }
  }

  if (adjuntos) {
    task.adjuntos = adjuntos;
  }

  if (nuevoComentario && usuarioAction) {
    const mentions = processMentions(nuevoComentario, usuarioAction, `Comentario en Tarea: ${task.tarea}`, 'tarea', task.id);
    task.comentarios.push({
      id: `cm_${Date.now()}`,
      usuario: usuarioAction,
      contenido: nuevoComentario,
      fecha: new Date().toISOString(),
      menciones: mentions
    });
  }

  // Add to status history
  task.historialEstados.push({
    fecha: new Date().toISOString(),
    estado: estadoDetalle || stage || task.stage,
    usuarioName: usuarioAction ? usuarioAction.name : 'Sistema',
    notas: notasEstado || ''
  });

  task.updatedAt = new Date().toISOString();

  // Chat notification if stage changed
  if (stage && oldStage !== stage) {
    const stageNames = { pendiente: 'Pendiente', en_proceso: 'En Proceso', finalizado: 'Finalizado' };
    const sysMsg: ChatMessage = {
      id: `sys_${Date.now()}`,
      usuario: usuarioAction || users[0],
      texto: `🔄 Tarea "${task.tarea}" pasó a [${stageNames[stage]}] (${task.estadoDetalle || ''})`,
      fecha: new Date().toISOString(),
      esSistema: true,
      tipoReferencia: 'stage_task',
      idReferencia: task.id,
      tituloReferencia: task.tarea
    };
    chatMessages.unshift(sysMsg);
    broadcastUpdate('chat_updated', chatMessages);
  }

  broadcastUpdate('tasks_updated', stageTasks);
  res.json(task);
});

// Trello Cards Routes
app.get('/api/trello', (req, res) => {
  res.json(trelloCards);
});

app.post('/api/trello', (req, res) => {
  const { titulo, descripcion, columna, prioridad, creador, asignados, subtareas, adjuntos } = req.body;

  if (!titulo || !creador) {
    return res.status(400).json({ error: 'Título y creador son obligatorios' });
  }

  const newCard: TrelloCard = {
    id: `tr_${Date.now()}`,
    titulo,
    descripcion: descripcion || '',
    columna: columna || 'tarea',
    prioridad: prioridad || 'media',
    adjuntos: adjuntos || [],
    asignados: asignados || [],
    creador,
    comentarios: [],
    subtareas: subtareas || [],
    menciones: [],
    posicion: trelloCards.filter(c => c.columna === (columna || 'tarea')).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mentions = processMentions(descripcion || '', creador, `Tablero Trello: ${titulo}`, 'trello', newCard.id);
  newCard.menciones = mentions;

  trelloCards.unshift(newCard);

  // Chat notice
  const sysMsg: ChatMessage = {
    id: `sys_${Date.now()}`,
    usuario: creador,
    texto: `📊 Tarjeta Trello creada: "${titulo}" en columna [${columna || 'Tarea'}]`,
    fecha: new Date().toISOString(),
    esSistema: true,
    tipoReferencia: 'trello_card',
    idReferencia: newCard.id,
    tituloReferencia: titulo
  };
  chatMessages.unshift(sysMsg);

  broadcastUpdate('trello_updated', trelloCards);
  broadcastUpdate('chat_updated', chatMessages);

  res.status(201).json(newCard);
});

app.patch('/api/trello/:id', (req, res) => {
  const { id } = req.params;
  const { columna, titulo, descripcion, prioridad, asignados, subtareas, nuevoComentario, usuarioAction, adjuntos } = req.body;

  const card = trelloCards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Tarjeta Trello no encontrada' });
  }

  const oldCol = card.columna;

  if (columna && columna !== card.columna) {
    card.columna = columna;
  }
  if (titulo) card.titulo = titulo;
  if (descripcion !== undefined) {
    card.descripcion = descripcion;
    if (usuarioAction) {
      const mentions = processMentions(descripcion, usuarioAction, `Tarjeta Trello: ${card.titulo}`, 'trello', card.id);
      card.menciones = Array.from(new Set([...card.menciones, ...mentions]));
    }
  }
  if (prioridad) card.prioridad = prioridad;
  if (asignados) card.asignados = asignados;
  if (subtareas) card.subtareas = subtareas;
  if (adjuntos) card.adjuntos = adjuntos;

  if (nuevoComentario && usuarioAction) {
    const mentions = processMentions(nuevoComentario, usuarioAction, `Comentario en Trello: ${card.titulo}`, 'trello', card.id);
    card.comentarios.push({
      id: `tc_${Date.now()}`,
      usuario: usuarioAction,
      contenido: nuevoComentario,
      fecha: new Date().toISOString(),
      menciones: mentions
    });
  }

  card.updatedAt = new Date().toISOString();

  if (columna && oldCol !== columna) {
    const colLabels = { tarea: 'Tarea', en_proceso: 'En Proceso', finalizado: 'Finalizado', suspendido: 'Suspendido' };
    const sysMsg: ChatMessage = {
      id: `sys_${Date.now()}`,
      usuario: usuarioAction || users[0],
      texto: `📋 Tarjeta Trello "${card.titulo}" movida a [${colLabels[columna]}]`,
      fecha: new Date().toISOString(),
      esSistema: true,
      tipoReferencia: 'trello_card',
      idReferencia: card.id,
      tituloReferencia: card.titulo
    };
    chatMessages.unshift(sysMsg);
    broadcastUpdate('chat_updated', chatMessages);
  }

  broadcastUpdate('trello_updated', trelloCards);
  res.json(card);
});

app.delete('/api/trello/:id', (req, res) => {
  const { id } = req.params;
  trelloCards = trelloCards.filter(c => c.id !== id);
  broadcastUpdate('trello_updated', trelloCards);
  res.json({ success: true });
});

// Chat Routes
app.get('/api/chat', (req, res) => {
  res.json(chatMessages);
});

app.post('/api/chat', (req, res) => {
  const { usuario, texto, adjuntos, tipoReferencia, idReferencia, tituloReferencia } = req.body;

  if (!usuario || !texto) {
    return res.status(400).json({ error: 'Usuario y texto de mensaje son requeridos' });
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    usuario,
    texto,
    adjuntos: adjuntos || [],
    fecha: new Date().toISOString(),
    tipoReferencia,
    idReferencia,
    tituloReferencia
  };

  const mentions = processMentions(texto, usuario, 'Chat Grupal', 'chat', newMsg.id);
  newMsg.menciones = mentions;

  chatMessages.unshift(newMsg);

  broadcastUpdate('chat_updated', chatMessages);
  res.status(201).json(newMsg);
});

// Notifications Routes
app.get('/api/notifications', (req, res) => {
  const { email } = req.query;
  if (email) {
    const userNotifs = notifications.filter(n => n.usuarioEmail.toLowerCase() === (email as string).toLowerCase());
    return res.json(userNotifs);
  }
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.vista = true;
    broadcastUpdate('notifications_updated', notifications);
  }
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const { email } = req.body;
  if (email) {
    notifications.forEach(n => {
      if (n.usuarioEmail.toLowerCase() === email.toLowerCase()) {
        n.vista = true;
      }
    });
    broadcastUpdate('notifications_updated', notifications);
  }
  res.json({ success: true });
});

// Whiteboard Routes
app.get('/api/whiteboard', (req, res) => {
  res.json(whiteboardElements);
});

app.post('/api/whiteboard', (req, res) => {
  const { elements } = req.body;
  if (Array.isArray(elements)) {
    whiteboardElements = elements;
    broadcastUpdate('whiteboard_updated', whiteboardElements);
  }
  res.json(whiteboardElements);
});

// Start Express + Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server executing at http://0.0.0.0:${PORT}`);
  });
}

startServer();
