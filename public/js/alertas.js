// Estado global del sistema
let isRealTimeActive = false;
let receivedAlertsQueue = [];

// Función para registrar mensajes en pantalla
function log(message) {
  const logConsole = document.getElementById('logConsole');
  const timestamp = new Date().toLocaleTimeString();
  const newEntry = document.createElement('p');
  newEntry.textContent = `[${timestamp}] ${message}`;
  logConsole.appendChild(newEntry);
}

// 1. Configurar notificaciones automáticas en tiempo real
function toggleRealTime() {
  isRealTimeActive = !isRealTimeActive;
  const statusEl = document.getElementById('wsStatus');
  const btnEl = document.getElementById('btnToggleWS');

  if (isRealTimeActive) {
    statusEl.textContent = "Conectado al servidor en tiempo real (Arenal Trade Zone Engine)";
    btnEl.textContent = "Desconectar Tiempo Real";
    log("Notificaciones automáticas en tiempo real ACTIVADAS.");
  } else {
    statusEl.textContent = "Desconectado";
    btnEl.textContent = "Conectar Tiempo Real";
    log("Notificaciones automáticas en tiempo real DESACTIVADAS.");
  }
}

// 2. Definir eventos de stock que disparan alertas
function evaluateStockEvents() {
  const product = document.getElementById('prodName').value;
  const stock = parseInt(document.getElementById('prodStock').value, 10);
  const minThreshold = parseInt(document.getElementById('minThreshold').value, 10);
  const expiryDays = parseInt(document.getElementById('expiryDays').value, 10);
  const expiryThreshold = parseInt(document.getElementById('expiryThreshold').value, 10);
  const reorderStatus = document.getElementById('reorderStatus').value;

  const generatedAlerts = [];

  // Evento A: Establecer umbrales mínimos de inventario
  if (stock < minThreshold) {
    generatedAlerts.push({
      id: Date.now() + 1,
      type: 'STOCK_MINIMO',
      message: `¡ALERTA!: El producto '${product}' está por debajo del umbral mínimo (Stock: ${stock}, Mínimo: ${minThreshold}).`
    });
  }

  // Evento B: Configurar alertas de productos próximos a vencer
  if (expiryDays <= expiryThreshold) {
    generatedAlerts.push({
      id: Date.now() + 2,
      type: 'PROXIMO_A_VENCER',
      message: `¡ALERTA VENCIMIENTO!: El producto '${product}' vence en ${expiryDays} días (Umbral: ${expiryThreshold} días).`
    });
  }

  // Evento C: Configurar alertas de reabastecimiento requerido
  if (reorderStatus === 'REQUERIDO') {
    generatedAlerts.push({
      id: Date.now() + 3,
      type: 'REABASTECIMIENTO',
      message: `¡ALERTA REABASTECIMIENTO!: Se requiere orden de compra inmediata para el producto '${product}'.`
    });
  }

  return generatedAlerts;
}

// 3. Probar el envío de notificaciones
function testSendNotification() {
  log("--- Iniciando prueba de envío de notificaciones ---");

  const alerts = evaluateStockEvents();
  receivedAlertsQueue = alerts;

  if (alerts.length === 0) {
    log("No se generaron alertas: Todos los parámetros están dentro de los rangos normales.");
  } else {
    alerts.forEach(alert => {
      log(`[ENVIADA] ${alert.type}: ${alert.message}`);
    });
  }
}

// 4. Validar que las alertas se reciban correctamente
function validateAlerts() {
  const validationDiv = document.getElementById('validationResult');
  log("--- Validando la recepción de alertas ---");

  if (receivedAlertsQueue.length === 0) {
    validationDiv.textContent = "VALIDACIÓN FALLIDA: No hay alertas en cola para procesar. Ejecute una prueba de envío primero.";
    log("ERROR: Se intentó validar sin alertas en la cola.");
    return;
  }

  let isValid = true;

  receivedAlertsQueue.forEach(alert => {
    if (!alert.id || !alert.type || !alert.message) {
      isValid = false;
    }
  });

  if (isValid) {
    validationDiv.textContent = `VALIDACIÓN CORRECTA: Se confirmaron y procesaron ${receivedAlertsQueue.length} alerta(s) correctamente en Arenal Trade Zone.`;
    log(`ÉXITO: Respuesta confirmada para ${receivedAlertsQueue.length} notificación(es).`);
  } else {
    validationDiv.textContent = "VALIDACIÓN FALLIDA: Formato de alerta no válido o incompleto.";
    log("ERROR: Estructura de notificación corrupta.");
  }
}