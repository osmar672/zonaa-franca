// Base de datos local en memoria
let medicalLeavesDB = [];

// Logger auxiliar para auditoría
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// 1. Registrar licencias médicas e incapacidades
function registerMedicalLeave() {
  const empId = document.getElementById('empId').value.trim();
  const empName = document.getElementById('empName').value.trim();
  const type = document.getElementById('typeSelect').value;
  const startDate = document.getElementById('startDate').value;
  const days = parseInt(document.getElementById('daysCount').value, 10);
  const doctorNote = document.getElementById('doctorNote').value.trim();

  if (!empId || !empName || !startDate || isNaN(days) || days <= 0) {
    log('ERROR: Complete todos los campos con valores válidos.');
    return;
  }

  const record = {
    id: 'LIC-' + Date.now(),
    empId,
    empName,
    type,
    startDate,
    days,
    doctorNote,
    status: 'REGISTRADA',
    payrollAdjusted: false,
    coverageAssigned: false,
    replacement: null
  };

  medicalLeavesDB.push(record);
  log(`REGISTRO ÉXITOSO: Incapacidad ${record.id} creada para ${empName} (${empId}) por ${days} días.`);
  updateLeaveSelect();
}

// Actualizar el selector para control y seguimiento
function updateLeaveSelect() {
  const select = document.getElementById('leaveSelect');
  select.innerHTML = '';

  if (medicalLeavesDB.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No hay registros pendientes';
    select.appendChild(opt);
    return;
  }

  medicalLeavesDB.forEach(rec => {
    const opt = document.createElement('option');
    opt.value = rec.id;
    opt.textContent = `${rec.id} - ${rec.empName} (${rec.type}) [${rec.status}]`;
    select.appendChild(opt);
  });
}

// 2. Controlar incapacidades y hacer seguimiento
function trackMedicalLeave() {
  const selectedId = document.getElementById('leaveSelect').value;
  const container = document.getElementById('trackingDetails');

  if (!selectedId) {
    container.textContent = 'No hay un registro seleccionado.';
    return;
  }

  const record = medicalLeavesDB.find(r => r.id === selectedId);

  if (record) {
    record.status = 'EN_SEGUIMIENTO';
    container.innerHTML = `
      <p><strong>ID Licencia:</strong> ${record.id}</p>
      <p><strong>Empleado:</strong> ${record.empName} (${record.empId})</p>
      <p><strong>Tipo:</strong> ${record.type}</p>
      <p><strong>Dictamen Médico:</strong> ${record.doctorNote}</p>
      <p><strong>Fecha Inicio:</strong> ${record.startDate} (${record.days} días en total)</p>
      <p><strong>Ajuste de Nómina:</strong> ${record.payrollAdjusted ? 'PROCESADO' : 'PENDIENTE'}</p>
      <p><strong>Cobertura de Turno:</strong> ${record.coverageAssigned ? `CUBIERTO POR: ${record.replacement}` : 'REQUIERE REEMPLAZO'}</p>
    `;
    log(`SEGUIMIENTO: Consulta realizada sobre la licencia ${record.id} en Arenal Trade Zone.`);
    updateLeaveSelect();
  }
}

// 3. Ajustar nómina según incidencias
function adjustPayroll() {
  const selectedId = document.getElementById('leaveSelect').value;
  const baseSalary = parseFloat(document.getElementById('baseSalary').value);
  const resultContainer = document.getElementById('payrollResult');

  if (!selectedId) {
    log('ERROR: Seleccione un registro de incapacidad para aplicar el ajuste de nómina.');
    return;
  }

  const record = medicalLeavesDB.find(r => r.id === selectedId);

  if (!record) {
    log('ERROR: Incidencia no encontrada.');
    return;
  }

  // Cálculo simplificado de subsidios/deducciones por incapacidad
  const dailyRate = baseSalary / 30;
  const daysDeducted = record.days;
  const companySubsidy = (dailyRate * daysDeducted) * 0.50; // Ejemplo 50% cobertura patronal
  const finalAdjustedSalary = baseSalary - (dailyRate * daysDeducted) + companySubsidy;

  record.payrollAdjusted = true;

  const summary = `
=== AJUSTE DE NÓMINA - ARENAL TRADE ZONE ===
Empleado            : ${record.empName} (${record.empId})
Salario Base Mensual: $${baseSalary.toFixed(2)}
Días Incapacitados  : ${record.days} día(s)
Descuento por Días  : -$${(dailyRate * daysDeducted).toFixed(2)}
Subsidio Patronal ZF: +$${companySubsidy.toFixed(2)}
--------------------------------------------
SALARIO NETO AJUSTADO: $${finalAdjustedSalary.toFixed(2)}
============================================
  `;

  resultContainer.textContent = summary;
  log(`NÓMINA AJUSTADA: Licencia ${record.id} procesada en sistema salarial.`);
  trackMedicalLeave();
}

// 4. Gestionar coberturas de turnos
function manageShiftCoverage() {
  const selectedId = document.getElementById('leaveSelect').value;
  const replacementEmp = document.getElementById('replacementEmp').value.trim();
  const shiftArea = document.getElementById('shiftArea').value.trim();

  if (!selectedId) {
    log('ERROR: Seleccione una incapacidad que requiera cobertura de turno.');
    return;
  }

  if (!replacementEmp || !shiftArea) {
    log('ERROR: Especifique el empleado sustituto y el área a cubrir.');
    return;
  }

  const record = medicalLeavesDB.find(r => r.id === selectedId);

  if (record) {
    record.coverageAssigned = true;
    record.replacement = replacementEmp;
    record.status = 'CUBIERTO_Y_ACTIVO';

    log(`COBERTURA ASIGNADA: ${replacementEmp} cubrirá a ${record.empName} en '${shiftArea}'.`);
    trackMedicalLeave();
  }
}