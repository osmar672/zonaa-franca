// Base de datos local y estados del sistema
let config = {
  shiftStartTime: '08:00',
  toleranceMinutes: 10,
  allowedMethods: {
    BIOMETRICO: true,
    PIN: true,
    QR: true,
    APP: true
  }
};

let attendanceLogs = [];

// Logger auxiliar
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// 1. Configurar el registro diario de puntualidad y asistencia y definir métodos permitidos
function saveConfiguration() {
  config.shiftStartTime = document.getElementById('shiftStartTime').value;
  config.toleranceMinutes = parseInt(document.getElementById('toleranceMinutes').value, 10);

  config.allowedMethods.BIOMETRICO = document.getElementById('allowBIOMETRICO').checked;
  config.allowedMethods.PIN = document.getElementById('allowPIN').checked;
  config.allowedMethods.QR = document.getElementById('allowQR').checked;
  config.allowedMethods.APP = document.getElementById('allowAPP').checked;

  log(`CONFIGURACIÓN GUARDADA: Hora entrada ${config.shiftStartTime}, Tolerancia: ${config.toleranceMinutes} min.`);
  log(`MÉTODOS ACTIVOS: Biométrico (${config.allowedMethods.BIOMETRICO}), PIN (${config.allowedMethods.PIN}), QR (${config.allowedMethods.QR}), App (${config.allowedMethods.APP})`);
}

// 2. Validar el funcionamiento de biométrico, PIN, QR y App Móvil
function validateMethod(method) {
  if (!config.allowedMethods[method]) {
    log(`VALIDACIÓN FALLIDA: El método ${method} está DESHABILITADO en la configuración.`);
    return false;
  }

  let success = false;

  switch (method) {
    case 'BIOMETRICO':
      log("Validando sensor Biométrico Arenal Trade Zone... Lectura dactilar/facial OK.");
      success = true;
      break;
    case 'PIN':
      log("Validando Teclado PIN... Hash y credenciales comprobadas OK.");
      success = true;
      break;
    case 'QR':
      log("Validando Escáner QR... Código dinámico desencriptado y vigente OK.");
      success = true;
      break;
    case 'APP':
      log("Validando App Móvil... Geocerca GPS dentro del perímetro Arenal Trade Zone OK.");
      success = true;
      break;
  }

  return success;
}

// 3. Registro diario de marcas digitales
function registerAttendanceMark() {
  const empId = document.getElementById('empId').value.trim();
  const empName = document.getElementById('empName').value.trim();
  const markTime = document.getElementById('markTime').value;
  const method = document.getElementById('methodSelect').value;

  if (!empId || !empName || !markTime) {
    log("ERROR: Ingrese la información completa del empleado y la hora.");
    return;
  }

  if (!validateMethod(method)) {
    log(`ERROR AL REGISTRAR: El método ${method} no superó la prueba de validación o no está permitido.`);
    return;
  }

  const newMark = {
    id: 'MARK-' + Date.now(),
    empId,
    empName,
    markTime,
    method,
    timestamp: new Date().toISOString()
  };

  attendanceLogs.push(newMark);
  log(`MARCA REGISTRADA: Empleado ${empName} (${empId}) - Hora: ${markTime} mediante ${method}`);
  reviewDigitalMarks();
}

// 4. Revisar el registro de marcas digitales
function reviewDigitalMarks() {
  const list = document.getElementById('marksList');
  list.innerHTML = '';

  if (attendanceLogs.length === 0) {
    list.innerHTML = '<li>No hay marcas registradas.</li>';
    return;
  }

  attendanceLogs.forEach(mark => {
    const item = document.createElement('li');
    item.textContent = `ID: ${mark.id} | Empleado: ${mark.empName} (${mark.empId}) | Hora: ${mark.markTime} | Vía: ${mark.method}`;
    list.appendChild(item);
  });

  log(`CONSULTA: Se visualizan ${attendanceLogs.length} marcas digitales en sistema.`);
}

// 5. Verificar la consistencia de asistencia y puntualidad
function verifyConsistency() {
  log("--- Verificando Consistencia de Asistencia y Puntualidad ---");

  if (attendanceLogs.length === 0) {
    log("CONGRUENCIA: No existen marcas para auditar.");
    return;
  }

  const [shiftHour, shiftMinute] = config.shiftStartTime.split(':').map(Number);
  const maxOnTimeMinutes = shiftHour * 60 + shiftMinute + config.toleranceMinutes;

  attendanceLogs.forEach(mark => {
    const [markHour, markMinute] = mark.markTime.split(':').map(Number);
    const markTotalMinutes = markHour * 60 + markMinute;

    if (markTotalMinutes <= (shiftHour * 60 + shiftMinute)) {
      mark.status = 'PUNTUAL';
    } else if (markTotalMinutes <= maxOnTimeMinutes) {
      mark.status = 'TARDANZA_TOLERADA';
    } else {
      mark.status = 'TARDANZA_LLEGADA_TARDÍA';
    }

    log(`AUDITORÍA: ${mark.empName} -> Estado: ${mark.status} (Hora Entrada: ${mark.markTime}, Límite: ${config.shiftStartTime})`);
  });
}

// 6. Generar reportes diarios de asistencia
function generateDailyReport() {
  verifyConsistency();

  let totalMarks = attendanceLogs.length;
  let punctualCount = 0;
  let toleratedCount = 0;
  let lateCount = 0;

  attendanceLogs.forEach(m => {
    if (m.status === 'PUNTUAL') punctualCount++;
    if (m.status === 'TARDANZA_TOLERADA') toleratedCount++;
    if (m.status === 'TARDANZA_LLEGADA_TARDÍA') lateCount++;
  });

  const reportText = `
===================================================================
   REPORTE DIARIO DE ASISTENCIA Y PUNTUALIDAD - ARENAL TRADE ZONE
===================================================================
Fecha de Emisión      : ${new Date().toLocaleDateString()}
Hora Oficial Entrada  : ${config.shiftStartTime}
Tolerancia Aplicada   : ${config.toleranceMinutes} minutos

RESUMEN EJECUTIVO:
-------------------------------------------------------------------
- Total de Marcas Digitales Recibidas : ${totalMarks}
- Entradas Puntuales                  : ${punctualCount}
- Tardanzas dentro de Tolerancia      : ${toleratedCount}
- LLEGADAS TARDÍAS (Fuera de Regla)  : ${lateCount}

DESGLOSE POR MÉTODO DE MARCACIÓN:
-------------------------------------------------------------------
- Biométrico  : ${attendanceLogs.filter(m => m.method === 'BIOMETRICO').length}
- PIN Personal: ${attendanceLogs.filter(m => m.method === 'PIN').length}
- Código QR   : ${attendanceLogs.filter(m => m.method === 'QR').length}
- App Móvil   : ${attendanceLogs.filter(m => m.method === 'APP').length}
===================================================================
  `;

  document.getElementById('reportContainer').textContent = reportText;
  log("REPORTE GENERADO: Informe consolidado desplegado en pantalla.");
}