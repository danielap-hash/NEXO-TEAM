import { StageTask, TrelloCard } from '../types';

export function exportTasksToExcel(tasks: StageTask[], filename = 'Reporte_Tareas_CollabTask.csv') {
  if (!tasks || tasks.length === 0) {
    alert('No hay tareas para exportar.');
    return;
  }

  // Define headers for Excel
  const headers = [
    'ID Tarea',
    'Fecha',
    'Encabezado / Tarea',
    'Etapa Flujo',
    'Estado Detalle',
    'Usuario Creador',
    'Email Creador',
    'Usuario Asignado',
    'Observaciones',
    'Archivos Adjuntos (Cant)',
    'Comentarios (Cant)',
    'Menciones @',
    'Fecha Creación',
    'Última Actualización'
  ];

  // Map rows
  const rows = tasks.map(t => [
    t.id,
    t.fecha || '',
    t.tarea ? `"${t.tarea.replace(/"/g, '""')}"` : '',
    t.stage === 'pendiente' ? 'Pendiente' : t.stage === 'en_proceso' ? 'En Proceso' : 'Finalizado',
    t.estadoDetalle ? `"${t.estadoDetalle.replace(/"/g, '""')}"` : 'Alta',
    t.usuarioCreador ? `"${t.usuarioCreador.name.replace(/"/g, '""')}"` : '',
    t.usuarioCreador ? t.usuarioCreador.email : '',
    t.usuarioAsignado ? `"${t.usuarioAsignado.name.replace(/"/g, '""')}"` : 'Sin asignar',
    t.observacion ? `"${t.observacion.replace(/"/g, '""')}"` : '',
    t.adjuntos ? t.adjuntos.length : 0,
    t.comentarios ? t.comentarios.length : 0,
    t.menciones ? `"${t.menciones.join(', ')}"` : '',
    t.createdAt ? new Date(t.createdAt).toLocaleString('es-ES') : '',
    t.updatedAt ? new Date(t.updatedAt).toLocaleString('es-ES') : ''
  ]);

  // Join headers and rows with UTF-8 BOM for Excel support
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTrelloToExcel(cards: TrelloCard[], filename = 'Reporte_Tablero_Trello.csv') {
  if (!cards || cards.length === 0) {
    alert('No hay tarjetas Trello para exportar.');
    return;
  }

  const headers = [
    'ID Tarjeta',
    'Columna / Estado',
    'Título',
    'Prioridad',
    'Descripción',
    'Creador',
    'Asignados',
    'Subtareas (Completadas/Total)',
    'Archivos Adjuntos (Cant)',
    'Comentarios (Cant)',
    'Fecha Creación',
    'Última Actualización'
  ];

  const colMap = {
    tarea: 'Tarea',
    en_proceso: 'En proceso',
    finalizado: 'Finalizado',
    suspendido: 'Suspendido'
  };

  const rows = cards.map(c => {
    const doneSub = c.subtareas ? c.subtareas.filter(s => s.completada).length : 0;
    const totalSub = c.subtareas ? c.subtareas.length : 0;
    const asignadosStr = c.asignados ? c.asignados.map(a => a.name).join(', ') : '';

    return [
      c.id,
      colMap[c.columna] || c.columna,
      c.titulo ? `"${c.titulo.replace(/"/g, '""')}"` : '',
      c.prioridad ? c.prioridad.toUpperCase() : 'MEDIA',
      c.descripcion ? `"${c.descripcion.replace(/"/g, '""')}"` : '',
      c.creador ? `"${c.creador.name.replace(/"/g, '""')}"` : '',
      `"${asignadosStr.replace(/"/g, '""')}"`,
      `"${doneSub}/${totalSub}"`,
      c.adjuntos ? c.adjuntos.length : 0,
      c.comentarios ? c.comentarios.length : 0,
      c.createdAt ? new Date(c.createdAt).toLocaleString('es-ES') : '',
      c.updatedAt ? new Date(c.updatedAt).toLocaleString('es-ES') : ''
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
