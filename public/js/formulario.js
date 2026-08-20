// Base de datos de solicitudes aprobadas (Metas pactadas en Arenal Trade Zone)
const approvedTargetsDB = {
  TECH_PARK: { name: 'TechPark Solutions S.A.', jobs: 100, investment: 500000, exports: 1000000 },
  GLOBAL_LOGISTICS: { name: 'Global Logistics Corp', jobs: 50, investment: 300000, exports: 800000 }
};

// Arreglos globales para alertas y bitácora
let activeAlerts = [];

// Logger interno
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// Cargar metas aprobadas en la pantalla
function loadApprovedTargets() {
  const companyKey = document.getElementById('companySelect').value;
  const targets = approvedTargetsDB[companyKey];

  document.getElementById('targetJobs').textContent = targets.jobs;
  document.getElementById('targetInvestment').textContent = targets.investment;
  document.getElementById('targetExports').textContent = targets.exports;

  log(`Metas cargadas para la empresa: ${targets.name}`);
}

// 1. Programar la comparación de metas y 2. Programar el sistema de alertas
function submitReportAndEvaluate() {
  const companyKey = document.getElementById('companySelect').value;
  const targets = approvedTargetsDB[companyKey];
  const period = document.getElementById('periodSelect').value;

  const realJobs = parseInt(document.getElementById('realJobs').value, 10);
  const realInvestment = parseFloat(document.getElementById('realInvestment').value);
  const realExports = parseFloat(document.getElementById('realExports').value);

  const dueDate = new Date(document.getElementById('dueDate').value);
  const submissionDate = new Date(document.getElementById('submissionDate').value);

  log(`--- Procesando Reporte de ${targets.name} (${period}) ---`);

  // Validación 1: Reporte Atrasado (Plazo vencido)
  if (submissionDate > dueDate) {
    const alertItem = {
      id: 'ALT-' + Date.now() + '-1',
      company: targets.name,
      period,
      type: 'REPORTE_ATRASADO',
      description: `Reporte entregado fuera de plazo. Fecha límite: ${dueDate.toISOString().split('T')[0]}, Enviado: ${submissionDate.toISOString().split('T')[0]}`,
      status: 'PENDIENTE',
      assignedAnalyst: null,
      resolutionNote: null,
      closedAt: null
    };
    activeAlerts.push(alertItem);
    log(`ALERTA GENERADA [REPORTE ATRASADO]: Entregado el ${submissionDate.toISOString().split('T')[0]}`);
  }

  // Validación 2: Comparación de Metas vs Cifras Reales
  if (realJobs < targets.jobs) {
    activeAlerts.push({
      id: 'ALT-' + Date.now() + '-2',
      company: targets.name,
      period,
      type: 'INCUMPLIMIENTO_EMPLEOS',
      description: `Empleos reales (${realJobs}) menores a la meta comprometida (${targets.jobs}).`,
      status: 'PENDIENTE',
      assignedAnalyst: null,
      resolutionNote: null,
      closedAt: null
    });
    log(`ALERTA GENERADA [INCUMPLIMIENTO METAS]: Empleos reales por debajo de la meta.`);
  }

  if (realInvestment < targets.investment) {
    activeAlerts.push({
      id: 'ALT-' + Date.now() + '-3',
      company: targets.name,
      period,
      type: 'INCUMPLIMIENTO_INVERSION',
      description: `Inversión ejecutada ($${realInvestment}) menor a la meta comprometida ($${targets.investment}).`,
      status: 'PENDIENTE',
      assignedAnalyst: null,
      resolutionNote: null,
      closedAt: null
    });
    log(`ALERTA GENERADA [INCUMPLIMIENTO METAS]: Inversión ejecutada por debajo de la meta.`);
  }

  if (realExports < targets.exports) {
    activeAlerts.push({
      id: 'ALT-' + Date.now() + '-4',
      company: targets.name,
      period,
      type: 'INCUMPLIMIENTO_EXPORTACIONES',
      description: `Exportaciones reales ($${realExports}) menores a la meta comprometida ($${targets.exports}).`,
      status: 'PENDIENTE',
      assignedAnalyst: null,
      resolutionNote: null,
      closedAt: null
    });
    log(`ALERTA GENERADA [INCUMPLIMIENTO METAS]: Volumen exportado por debajo de la meta.`);
  }

  renderAlertsUI();
  updateAlertSelect();
}

// Desplegar las alertas en la interfaz
function renderAlertsUI() {
  const container = document.getElementById('alertsContainer');
  container.innerHTML = '';

  if (activeAlerts.length === 0) {
    container.innerHTML = '<p>No hay alertas activas. Cifras y plazos conformes a lo pactado.</p>';
    return;
  }

  activeAlerts.forEach(alert => {
    const card = document.createElement('div');
    card.innerHTML = `
      <p><strong>ID Alerta:</strong> ${alert.id} | <strong>Tipo:</strong> ${alert.type}</p>
      <p><strong>Empresa:</strong> ${alert.company} | <strong>Período:</strong> ${alert.period}</p>
      <p><strong>Detalle:</strong> ${alert.description}</p>
      <p><strong>Estado:</strong> ${alert.status}</p>
      ${alert.assignedAnalyst ? `<p><strong>Analista:</strong> ${alert.assignedAnalyst} | <strong>Cierre:</strong> ${alert.closedAt}</p>` : ''}
      ${alert.resolutionNote ? `<p><strong>Nota de Atención:</strong> ${alert.resolutionNote}</p>` : ''}
      <hr>
    `;
    container.appendChild(card);
  });
}

// Actualizar el selector de alertas para gestionar
function updateAlertSelect() {
  const select = document.getElementById('alertSelect');
  select.innerHTML = '';

  const pendingAlerts = activeAlerts.filter(a => a.status === 'PENDIENTE');

  if (pendingAlerts.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No hay alertas pendientes para gestionar';
    select.appendChild(opt);
    return;
  }

  pendingAlerts.forEach(alert => {
    const opt = document.createElement('option');
    opt.value = alert.id;
    opt.textContent = `${alert.id} - ${alert.company} (${alert.type})`;
    select.appendChild(opt);
  });
}

// 3. Crear la funcionalidad para asignar cada alerta a un analista responsable y permitirle escribir una nota de atención con fecha de cierre
function assignAndCloseAlert() {
  const alertId = document.getElementById('alertSelect').value;
  const analyst = document.getElementById('analystName').value.trim();
  const note = document.getElementById('resolutionNote').value.trim();
  const closingDate = document.getElementById('closingDate').value;

  if (!alertId) {
    log('ERROR: Debe seleccionar una alerta pendiente de la lista.');
    return;
  }

  if (!analyst || !note || !closingDate) {
    log('ERROR: Complete el analista, la nota de atención y la fecha de cierre.');
    return;
  }

  const alertObj = activeAlerts.find(a => a.id === alertId);

  if (alertObj) {
    alertObj.status = 'RESUELTA_Y_CERRADA';
    alertObj.assignedAnalyst = analyst;
    alertObj.resolutionNote = note;
    alertObj.closedAt = closingDate;

    log(`ÉXITO: Alerta ${alertId} asignada a ${analyst} y CERRADA el ${closingDate}.`);
    
    renderAlertsUI();
    updateAlertSelect();
  } else {
    log('ERROR: No se encontró la alerta especificada.');
  }
}

// Carga inicial
document.addEventListener('DOMContentLoaded', () => {
  loadApprovedTargets();
});