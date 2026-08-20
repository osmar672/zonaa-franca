// Base de datos de tarjetas y tareas de Arenal Trade Zone
const cardsDatabase = {
  'CARD-101': {
    id: 'CARD-101',
    title: 'Importación de Componentes Electrónicos',
    zone: 'Arenal Trade Zone - Sector A',
    status: 'EN_PROCESO',
    tasks: []
  },
  'CARD-102': {
    id: 'CARD-102',
    title: 'Inspección Bodega B-04',
    zone: 'Arenal Trade Zone - Sector B',
    status: 'PENDIENTE',
    tasks: []
  }
};

// Logger interno
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// 1. Revisar detalles de la tarjeta
function reviewCardDetails() {
  const selectedCardId = document.getElementById('cardSelect').value;
  const card = cardsDatabase[selectedCardId];
  const container = document.getElementById('cardDetailsContainer');

  if (!card) {
    container.innerHTML = '<p>No se encontraron detalles para esta tarjeta.</p>';
    return;
  }

  container.innerHTML = `
    <p><strong>ID Tarjeta:</strong> ${card.id}</p>
    <p><strong>Operación:</strong> ${card.title}</p>
    <p><strong>Ubicación:</strong> ${card.zone}</p>
    <p><strong>Estado:</strong> ${card.status}</p>
    <p><strong>Tareas Requeridas (${card.tasks.length}):</strong></p>
    <ul>
      ${card.tasks.length === 0 ? '<li>No hay tareas definidas aún.</li>' : card.tasks.map(t => `<li>${t.title} - [${t.status}] (Asignado: ${t.assignee})</li>`).join('')}
    </ul>
  `;

  log(`DETALLES REVISADOS: Tarjeta ${card.id} cargada en pantalla.`);
  updateTaskSelect();
}

// 2. Definir tareas requeridas
function defineRequiredTask() {
  const selectedCardId = document.getElementById('cardSelect').value;
  const card = cardsDatabase[selectedCardId];

  const taskTitle = document.getElementById('taskTitle').value.trim();
  const assignee = document.getElementById('assignee').value.trim();

  if (!taskTitle || !assignee) {
    log('ERROR: Ingrese un título y un responsable para definir la tarea.');
    return;
  }

  const newTask = {
    id: 'TSK-' + Date.now(),
    title: taskTitle,
    assignee: assignee,
    status: 'ASIGNADA',
    notes: null
  };

  card.tasks.push(newTask);
  log(`TAREA DEFINIDA: '${taskTitle}' asignada a ${assignee} en tarjeta ${card.id}.`);

  reviewCardDetails();
}

// Actualizar el selector de tareas para la sección de completado
function updateTaskSelect() {
  const selectedCardId = document.getElementById('cardSelect').value;
  const card = cardsDatabase[selectedCardId];
  const taskSelect = document.getElementById('taskSelect');

  taskSelect.innerHTML = '';

  const pendingTasks = card.tasks.filter(t => t.status === 'ASIGNADA');

  if (pendingTasks.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No hay tareas pendientes';
    taskSelect.appendChild(opt);
    return;
  }

  pendingTasks.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.title} (${t.assignee})`;
    taskSelect.appendChild(opt);
  });
}

// 3. Completar trabajo asignado
function completeAssignedWork() {
  const selectedCardId = document.getElementById('cardSelect').value;
  const card = cardsDatabase[selectedCardId];
  const taskId = document.getElementById('taskSelect').value;
  const notes = document.getElementById('completionNotes').value.trim();

  if (!taskId) {
    log('ERROR: Seleccione una tarea válida para completar.');
    return;
  }

  const task = card.tasks.find(t => t.id === taskId);

  if (task) {
    task.status = 'COMPLETADA';
    task.notes = notes;
    log(`TRABAJO COMPLETADO: Tarea '${task.title}' marcada como COMPLETADA por ${task.assignee}.`);
    reviewCardDetails();
  } else {
    log('ERROR: No se encontró la tarea seleccionada.');
  }
}

// 4. Verificar finalización
function verifyCompletion() {
  const selectedCardId = document.getElementById('cardSelect').value;
  const card = cardsDatabase[selectedCardId];
  const verificationDiv = document.getElementById('verificationResult');

  log(`--- Verificando finalización de la tarjeta ${card.id} en Arenal Trade Zone ---`);

  if (card.tasks.length === 0) {
    verificationDiv.textContent = 'VERIFICACIÓN INCOMPLETA: No existen tareas definidas para esta tarjeta.';
    log('VERIFICACIÓN FALLIDA: Sin tareas asociadas.');
    return;
  }

  const pendingTasks = card.tasks.filter(t => t.status !== 'COMPLETADA');

  if (pendingTasks.length === 0) {
    card.status = 'VERIFICADA_Y_COMPLETADA';
    verificationDiv.textContent = `VERIFICACIÓN EXITOSA: Todas las tareas (${card.tasks.length}) de la tarjeta ${card.id} han sido completadas satisfactoriamente.`;
    log(`VERIFICACIÓN COMPLETA: Operación ${card.id} aprobada y lista para cierre aduanal.`);
  } else {
    verificationDiv.textContent = `VERIFICACIÓN PENDIENTE: Quedan ${pendingTasks.length} tarea(s) por completar.`;
    log(`VERIFICACIÓN INCOMPLETA: ${pendingTasks.length} tarea(s) pendientes en ${card.id}.`);
  }

  reviewCardDetails();
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
  reviewCardDetails();
});