// Base de datos simulada de empleados de Arenal Trade Zone
const employeesDB = {
  'ATZ-4092': {
    id: 'ATZ-4092',
    name: 'Carlos Mendoza Alvarado',
    position: 'Ingeniero de Calidad de Software',
    department: 'Tecnología de Operaciones ZF',
    startDate: '2022-03-15',
    salaryGross: 2400.00,
    salaryNet: 2150.00,
    status: 'ACTIVO'
  }
};

// Historial de trámites
let processedRequestsDB = [];
let currentDocument = null;

// Logger interno
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('p');
  entry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(entry);
}

// 1. Validar requisitos para cada documento
function validateRequirements() {
  const docType = document.getElementById('docType').value;
  const box = document.getElementById('requirementsBox');

  const requirements = {
    'CARTA_PATRONAL': 'Requisitos: Estado empleado activo, identificación al día y destino de entidad especificado.',
    'CONSTANCIA_INGRESOS': 'Requisitos: Mínimo 3 meses laborando en Arenal Trade Zone, desglose de salario bruto y neto.',
    'CERTIFICADO_TRABAJO': 'Requisitos: Histórico de puesto y fecha exacta de ingreso verificada por RRHH.'
  };

  box.textContent = requirements[docType] || 'Seleccione un tipo de documento.';
  log(`REQUISITOS REVISADOS: Mostrando requisitos para ${docType}.`);
}

// 2. Revisar datos del empleado antes de generar el documento
function reviewEmployeeData() {
  const empId = document.getElementById('empId').value.trim();
  const preview = document.getElementById('employeeDataPreview');
  const emp = employeesDB[empId];

  if (!emp) {
    preview.innerHTML = '<p style="color: red;">Empleado no encontrado en el padrón de Arenal Trade Zone.</p>';
    log(`ERROR: No se encontraron datos para el ID ${empId}.`);
    return;
  }

  preview.innerHTML = `
    <p><strong>Puesto:</strong> ${emp.position} | <strong>Departamento:</strong> ${emp.department}</p>
    <p><strong>Fecha Ingreso:</strong> ${emp.startDate} | <strong>Salario Bruto:</strong> $${emp.salaryGross.toFixed(2)} USD</p>
    <p><strong>Estatus RRHH:</strong> <span style="color: green;">${emp.status}</span></p>
  `;

  log(`DATOS REVISADOS: Información laboral verificada para ${emp.name} (${emp.id}).`);
}

// 3. Emitir documentos específicos (Carta Patronal, Constancia de Ingresos, Certificado de Trabajo)
function issueDocument(type) {
  const empId = document.getElementById('empId').value.trim();
  const target = document.getElementById('targetInstitution').value.trim();
  const emp = employeesDB[empId];

  if (!emp) {
    log('ERROR: Debe ingresar un empleado válido para emitir el documento.');
    return;
  }

  if (!target) {
    log('ERROR: Especifique la institución o persona destinataria del trámite.');
    return;
  }

  const requestId = 'TRM-' + Math.floor(100000 + Math.random() * 900000);
  const today = new Date().toLocaleDateString('es-CR');

  let content = '';

  if (type === 'CARTA_PATRONAL') {
    content = `
================================================================================
                       ARENAL TRADE ZONE - CARTA PATRONAL
================================================================================
Fecha de Emisión: ${today}
Código de Trámite: ${requestId}

A quien corresponda (${target}):

Por medio de la presente se hace constar que el(la) Sra.(Sr.) ${emp.name},
poseedor(a) del carnet interno ${emp.id}, labora activamente para la empresa
operadora en Arenal Trade Zone desempeñando el cargo de ${emp.position}
en el departamento de ${emp.department}.

Documento emitido a solicitud del interesado para trámites externos.

Atentamente,
Dirección de Recursos Humanos
Arenal Trade Zone S.A.
================================================================================
    `;
  } else if (type === 'CONSTANCIA_INGRESOS') {
    content = `
================================================================================
                  ARENAL TRADE ZONE - CONSTANCIA DE INGRESOS
================================================================================
Fecha de Emisión: ${today}
Código de Trámite: ${requestId}

Dirigido a: ${target}

Certificamos que el colaborador ${emp.name} (${emp.id}) percibe la siguiente
estructura salarial dentro de nuestra zona franca:

- Salario Bruto Mensual: $${emp.salaryGross.toFixed(2)} USD
- Salario Neto Promedio: $${emp.salaryNet.toFixed(2)} USD
- Antigüedad Laboral: Desde el ${emp.startDate}

Atentamente,
Departamento de Nóminas y Compensaciones
Arenal Trade Zone
================================================================================
    `;
  } else if (type === 'CERTIFICADO_TRABAJO') {
    content = `
================================================================================
                  ARENAL TRADE ZONE - CERTIFICADO DE TRABAJO
================================================================================
Fecha de Emisión: ${today}
Código de Trámite: ${requestId}

Se hace constar formalmente que ${emp.name} ha formado parte de la plantilla
de Arenal Trade Zone desde la fecha ${emp.startDate}, ocupando de manera continua
y satisfactoria la posición de ${emp.position}.

Se extiende el presente certificado para los fines laborales pertinentes ante ${target}.

Atentamente,
Gestión de Talentos
Arenal Trade Zone
================================================================================
    `;
  }

  currentDocument = {
    id: requestId,
    empId: emp.id,
    empName: emp.name,
    type: type,
    target: target,
    content: content,
    verified: false,
    downloadAllowed: false,
    notified: false
  };

  document.getElementById('documentViewer').textContent = content;
  registerProcedure(currentDocument);
  log(`DOCUMENTO EMITIDO: ${type} generado con folio ${requestId}.`);
}

// 4. Registrar el trámite realizado
function registerProcedure(doc) {
  processedRequestsDB.push(doc);
  const tbody = document.getElementById('auditTableBody');

  const row = document.createElement('tr');
  row.id = `row-${doc.id}`;
  row.innerHTML = `
    <td>${doc.id}</td>
    <td>${doc.empName}</td>
    <td>${doc.type}</td>
    <td>${doc.target}</td>
    <td id="status-${doc.id}">EMITIDO</td>
  `;
  tbody.appendChild(row);
  log(`REGISTRO: Trámite ${doc.id} almacenado en el historial de auditoría.`);
}

// 5. Verificar formato y contenido de los documentos
function verifyFormatAndContent() {
  if (!currentDocument) {
    log('ERROR: No hay ningún documento emitido para verificar.');
    return;
  }

  currentDocument.verified = true;
  document.getElementById(`status-${currentDocument.id}`).textContent = 'VERIFICADO';
  log(`VERIFICACIÓN EXITOSA: Estructura, sellos digitales y datos del folio ${currentDocument.id} validados.`);
}

// 6. Permitir descarga o impresión del documento
function downloadOrPrintDocument() {
  if (!currentDocument) {
    log('ERROR: Primero debe emitir un documento.');
    return;
  }

  if (!currentDocument.verified) {
    log('ADVERTENCIA: Debe verificar el formato y contenido antes de permitir la descarga/impresión.');
    return;
  }

  currentDocument.downloadAllowed = true;
  document.getElementById(`status-${currentDocument.id}`).textContent = 'LISTO_DESCARGA';
  
  window.print();
  log(`DESCARGA/IMPRESIÓN: Documento ${currentDocument.id} exportado / enviado a la cola de impresión.`);
}

// 7. Notificar al empleado cuando el documento esté listo
function notifyEmployee() {
  if (!currentDocument) {
    log('ERROR: No hay trámite activo para notificar.');
    return;
  }

  if (!currentDocument.downloadAllowed) {
    log('ERROR: El documento aún no está autorizado para descarga. Complete la verificación primero.');
    return;
  }

  currentDocument.notified = true;
  document.getElementById(`status-${currentDocument.id}`).textContent = 'NOTIFICADO';
  log(`NOTIFICACIÓN ENVIADA: Alerta de documento disponible enviada a ${currentDocument.empName} (${currentDocument.empId}).`);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  validateRequirements();
});